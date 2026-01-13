#!/usr/bin/env python3
import logging
import shutil
import signal
import tarfile
import threading
import traceback
import uuid
from multiprocessing import Process
from pathlib import Path

from .apiclient import FLSClient
from .arch import detect_arch
from .config import FLS_MOUNT_PREFIX
from .dockerclient import DockerClient
from .errors import FLSAlreadyClaimedError, FLSAPIError
from .infraerrors import INFRA_EXCEPTIONS
from .models import Arch

# ------------------------------------------------------------
# logging
# ------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

log = logging.getLogger("fls-grade")

# ------------------------------------------------------------
# heartbeat
# ------------------------------------------------------------


def grading_heartbeat(interval=20):
    api = FLSClient()
    stop = threading.Event()

    def _sigterm(_signo, _frame):
        stop.set()

    signal.signal(signal.SIGTERM, _sigterm)

    while not stop.is_set():
        try:
            api.grading_heartbeat()
        except Exception:
            pass
        stop.wait(interval)


# ------------------------------------------------------------
# safe tar extraction
# ------------------------------------------------------------


def safe_extract_tar(tar_path: Path, dest: Path) -> None:
    """
    Safely extract a tar.gz (or tar.*) archive.

    Allowed:
      - directories
      - regular files (no links)

    Disallowed:
      - symlinks
      - hardlinks
      - device files
      - absolute paths
      - path traversal
    """
    dest = dest.resolve()

    with tarfile.open(tar_path, "r:*") as tar:
        for member in tar.getmembers():
            name = member.name

            # no absolute paths
            if name.startswith("/") or name.startswith("\\"):
                raise Exception(f"absolute path in tar: {name}")

            # no path traversal
            target = (dest / name).resolve()
            if not target.is_relative_to(dest):
                raise Exception(f"path traversal in tar: {name}")

            # directories
            if member.isdir():
                target.mkdir(parents=True, exist_ok=True)
                target.chmod(0o755)
                continue

            # regular files ONLY (no links)
            if member.isreg():
                if member.linkname:
                    raise Exception(f"hardlink disallowed: {name}")

                target.parent.mkdir(parents=True, exist_ok=True)

                src = tar.extractfile(member)
                if src is None:
                    raise Exception(f"failed to extract file: {name}")

                with src, open(target, "wb") as dst:
                    dst.write(src.read())

                target.chmod(member.mode & 0o777)
                continue

            # everything else is forbidden
            raise RuntimeError(f"disallowed tar entry type: {name}")


# ------------------------------------------------------------
# main grading pass
# ------------------------------------------------------------


def run_once() -> None:
    client = FLSClient()

    # we do not know the arch at startup; workers are arch-pinned
    arch: Arch = detect_arch()

    try:
        submissions = client.list_submissions(arch)
    except Exception as e:
        # infra failure → abort immediately
        log.exception("failed to list submissions")
        return

    if not submissions:
        log.info("no submissions available")
        return

    submission = submissions[0]

    try:
        client.claim_submission(submission)
    except FLSAlreadyClaimedError:
        log.info("submission %s already claimed", submission.id)
        return
    except Exception:
        log.exception("failed to claim submission")
        return

    log.info(f"claimed submission {submission.id} by user {submission.user_id}")

    # all filesystem work happens under FLS_MOUNT_PREFIX
    base_dir = FLS_MOUNT_PREFIX / "jobs" / str(uuid.uuid4())
    tar_dir = base_dir / "tarball"
    src_dir = base_dir / "src"
    out_dir = base_dir / "out"

    log_path = base_dir / "logs.txt"

    hb_proc = Process(
        target=grading_heartbeat,
        daemon=True,
    )

    hb_proc.start()

    try:
        tar_path = tar_dir / "submission.tar"
        try:
            tar_dir.mkdir(parents=True)
            src_dir.mkdir()
            out_dir.mkdir()
            # If Docker is down, this is an infra error
            docker = DockerClient(log_path=log_path)

        except Exception as e:
            log.exception("Infrastructure setup failed (FS or Docker)")
            raise FLSAPIError("Local infrastructure failure") from e

        # download and extract
        client.download_tarball(submission, tar_path)
        safe_extract_tar(tar_path, src_dir)

        # ----------------------------------------------------
        # run builder + grader
        # ----------------------------------------------------

        passed = False

        try:
            bootable = docker.run_builder(
                workspace_dir=src_dir,
                output_dir=out_dir,
            )

            docker.run_grader(bootable_img=bootable)
            passed = True

        except INFRA_EXCEPTIONS as e:
            raise
        except Exception as e:
            # student fault: build or runtime failure
            log.exception("grading failed for submission %s", submission.id)

        # ----------------------------------------------------
        # submit result
        # ----------------------------------------------------
        client.submit_result(
            submission,
            passed=passed,
            log_path=log_path,
        )

    except INFRA_EXCEPTIONS as e:
        # infra error → cancel immediately
        log.exception(f"infrastructure error; cancelling submission...{e}")
        try:
            client.cancel_submission(submission)
        except Exception:
            log.exception("failed to cancel submission")

    except Exception:
        # any other unexpected failure: fail submission but do not crash worker
        log.exception("unexpected error during grading")

        with log_path.open("a", encoding="utf-8") as f:
            f.write("\n--- grader traceback ---\n")
            traceback.print_exc(file=f)

        try:
            client.submit_result(
                submission,
                passed=False,
                log_path=log_path,
            )
        except Exception:
            log.exception("failed to submit failure result")

    finally:
        hb_proc.terminate()
        hb_proc.join(timeout=2)
        # best-effort cleanup
        try:
            shutil.rmtree(base_dir)
        except Exception:
            log.warning("failed to clean up %s", base_dir)
