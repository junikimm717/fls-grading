import logging
import os
from pathlib import Path
from typing import Iterable

import docker

from .config import (
    FLS_GRADING_BUILDER,
    FLS_GRADING_GRADER,
    FLS_HOST_ROOT,
    FLS_MOUNT_PREFIX,
)

MAX_LOG_BYTES = 20 * 1024 * 1024  # 20MB
TRUNCATION_NOTICE = (
    b"\n\n"
    b"====================\n"
    b"[fls] LOG TRUNCATED: output exceeded 20MB\n"
    b"====================\n"
)


host_cpus = os.cpu_count()
if host_cpus is None:
    raise RuntimeError("failed to detect host CPU count")
usable_cpus = max(1, host_cpus - 1)

log = logging.getLogger("fls-docker")


class DockerClient:
    """
    Hardened Docker client grading.

    Invariants:
    - Builder runs with:
        * read-only root
        * /dist as tmpfs (10GB)
        * /workspace read-only
        * no network
        * hard resource limits
        * artifact extracted via docker cp (get_archive)
    - Grader runs ephemerally
    """

    def __init__(
        self,
        *,
        log_path: Path,
    ):
        """
        Args:
            log_path:
                File where all container output is appended.

            host_root:
                Real host directory visible to the Docker daemon.

            mount_prefix:
                Path inside *this process* where host_root is mounted.
                Used for path translation when running inside a container.
        """
        self.client = docker.from_env()

        self.log_path = log_path.resolve()
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        self.log_path.touch(exist_ok=True)

        self.host_root = FLS_HOST_ROOT
        self.mount_prefix = FLS_MOUNT_PREFIX

    # ------------------------------------------------------------------
    # path translation
    # ------------------------------------------------------------------

    def _to_host_path(self, p: Path) -> Path:
        """
        Translate a path under mount_prefix to a real host path.
        """
        p = p.resolve()
        try:
            rel = p.relative_to(self.mount_prefix)
        except ValueError:
            raise RuntimeError(
                f"path {p} is not under mount prefix {self.mount_prefix}"
            )
        return self.host_root / rel

    # ------------------------------------------------------------------
    # logging helpers
    # ------------------------------------------------------------------

    def _write_stream_to_file(
        self,
        stream: Iterable[bytes],
        *,
        dest: Path,
        max_bytes: int,
    ) -> None:
        total = 0
        with dest.open("wb") as f:
            for chunk in stream:
                if not isinstance(chunk, (bytes, bytearray)):
                    chunk = str(chunk).encode()

                total += len(chunk)
                if total > max_bytes:
                    raise RuntimeError(f"artifact exceeded size limit ({total} bytes)")

                f.write(chunk)

    def _append_logs(self, stream: Iterable[bytes]) -> None:
        written = 0

        with self.log_path.open("ab") as f:
            for chunk in stream:
                if not isinstance(chunk, (bytes, bytearray)):
                    chunk = str(chunk).encode()

                if written < MAX_LOG_BYTES:
                    remaining = MAX_LOG_BYTES - written

                    if len(chunk) <= remaining:
                        f.write(chunk)
                        written += len(chunk)
                    else:
                        # write partial chunk
                        f.write(chunk[:remaining])
                        written += remaining

                        # write truncation notice once
                        f.write(TRUNCATION_NOTICE)

                f.flush()

    # ------------------------------------------------------------------
    # builder
    # ------------------------------------------------------------------

    def run_builder(
        self,
        *,
        workspace_dir: Path,
        output_dir: Path,
    ) -> Path:
        """
        Run the hardened builder container and extract bootable.img.

        Returns:
            Path to bootable.img on the host.
        """
        workspace_host = self._to_host_path(workspace_dir)
        output_dir = output_dir.resolve()
        output_dir.mkdir(parents=True, exist_ok=True)

        log.info(f"pulling image {FLS_GRADING_BUILDER}")
        self.client.images.pull(FLS_GRADING_BUILDER)

        log.info("creating builder container")

        container = self.client.containers.create(
            image=FLS_GRADING_BUILDER,
            entrypoint=["/usr/bin/tini", "--"],
            command=["sleep", "infinity"],
            tty=True,
            network_mode="none",
            read_only=True,
            detach=True,
            volumes={
                str(workspace_host): {
                    "bind": "/workspace",
                    "mode": "ro",
                },
            },
            tmpfs={
                "/tmp": "size=4g,mode=755,exec",
                "/dist": "size=10g,mode=755,exec",
                "/writable_src": "size=6g,mode=755,exec",
            },
            environment={
                "DIST": "/dist",
                "SRC": "/writable_src",
            },
            mem_limit="8g",
            memswap_limit="8g",
            nano_cpus=usable_cpus * 1_000_000_000,
            pids_limit=256,
        )

        try:
            container.start()

            log.info("executing build script")

            exec_id = self.client.api.exec_create(
                container.id,
                cmd=[
                    "sh",
                    "-c",
                    "rsync -a --delete /src/ /writable_src/ && exec /build-all-stages.sh",
                ],
                stdout=True,
                stderr=True,
            )["Id"]

            output = self.client.api.exec_start(
                exec_id,
                stream=True,
            )

            self._append_logs(output)

            inspect = self.client.api.exec_inspect(exec_id)
            exit_code = inspect["ExitCode"]

            if exit_code != 0:
                raise RuntimeError(f"builder failed with exit code {exit_code}")

            # Bootable image streaming
            exec_id = self.client.api.exec_create(
                container.id,
                cmd=["sh", "-c", "exec cat /dist/bootable.img"],
                stdout=True,
                stderr=False,
            )["Id"]

            stream = self.client.api.exec_start(exec_id, stream=True)

            bootable = output_dir / "bootable.img"
            self._write_stream_to_file(
                stream,
                dest=bootable,
                max_bytes=220 * 1024 * 1024,  # e.g. 220MB cap
            )
            exit_code = inspect["ExitCode"]
            if exit_code != 0:
                raise RuntimeError(
                    f"artifact stream failed with exit code {inspect['ExitCode']}"
                )
            # ------------------

            if not bootable.exists():
                raise RuntimeError("bootable.img not found after extraction")

            return bootable

        finally:
            log.info("destroying builder container")
            try:
                container.remove(force=True)
            except Exception:
                log.exception("failed to remove builder container")

    # ------------------------------------------------------------------
    # grader
    # ------------------------------------------------------------------

    def run_grader(
        self,
        *,
        bootable_img: Path,
    ) -> None:
        """
        Run the grader container against a bootable image.
        """
        bootable_img = bootable_img.resolve()
        dist_dir = bootable_img.parent
        dist_host = self._to_host_path(dist_dir)

        log.info("starting grader container")

        log.info(f"pulling image {FLS_GRADING_GRADER}")
        self.client.images.pull(FLS_GRADING_GRADER)

        container = self.client.containers.run(
            image=FLS_GRADING_GRADER,
            command=["/grade.py", "/dist/bootable.img"],
            remove=True,
            detach=True,
            tty=True,
            network_mode="none",
            volumes={
                str(dist_host): {
                    "bind": "/dist",
                    "mode": "rw",
                }
            },
        )

        try:
            self._append_logs(container.logs(stream=True))
            result = container.wait()
            status = int(result["StatusCode"])

            if status != 0:
                raise RuntimeError(f"grader failed with exit code {status}")

        finally:
            try:
                container.remove(force=True)
            except Exception:
                pass
