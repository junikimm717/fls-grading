import logging
from pathlib import Path

import requests

from .config import FLS_GRADING_BASEURL, FLS_GRADING_SECRET
from .errors import (
    FLSAlreadyClaimedError,
    FLSAuthError,
    FLSBadResponseError,
    FLSConflictError,
    FLSNotFoundError,
)
from .models import Arch, Submission

log = logging.getLogger("fls-client")


class FLSClient:
    def __init__(self, timeout: float = 30.0):
        self.baseurl = FLS_GRADING_BASEURL
        self.session = requests.Session()
        self.session.headers.update(
            {
                "Authorization": f"Bearer {FLS_GRADING_SECRET}",
                "Accept": "application/json",
            }
        )
        self.timeout = timeout

    # -----------------------------
    # internal helpers
    # -----------------------------

    def _handle_response(self, r: requests.Response) -> requests.Response:
        if r.status_code == 401 or r.status_code == 403:
            raise FLSAuthError("authentication failed")

        if r.status_code == 404:
            raise FLSNotFoundError("resource not found")

        if r.status_code == 409:
            raise FLSConflictError("conflict")

        if r.status_code == 409:
            raise FLSAlreadyClaimedError("submission already claimed")

        if not r.ok:
            raise FLSBadResponseError(r.status_code, r.text)

        return r

    def _get(self, path: str, **kwargs) -> requests.Response:
        url = f"{self.baseurl}{path}"
        log.debug("GET %s", url)
        r = self.session.get(url, timeout=self.timeout, **kwargs)
        return self._handle_response(r)

    def _post(self, path: str, **kwargs) -> requests.Response:
        url = f"{self.baseurl}{path}"
        log.debug("POST %s", url)
        r = self.session.post(url, timeout=self.timeout, **kwargs)
        return self._handle_response(r)

    # -----------------------------
    # public API
    # -----------------------------

    def list_submissions(self, arch: Arch) -> list[Submission]:
        """
        GET /api/grader/submissions?arch=...
        """
        r = self._get("/api/grader/submissions", params={"arch": arch})
        raw = r.json()

        if not isinstance(raw, list):
            raise FLSBadResponseError(
                r.status_code,
                f"expected list, got {type(raw)}",
            )

        return [Submission.from_json(item) for item in raw]

    def claim_submission(self, submission: Submission) -> None:
        """
        POST /api/grader/submissions/[id]/claim
        """
        self._post(f"/api/grader/submissions/{submission.id}/claim")

    def cancel_submission(self, submission: Submission) -> None:
        """
        POST /api/grader/submissions/[id]/cancel
        """
        self._post(f"/api/grader/submissions/{submission.id}/cancel")

    def download_tarball(self, submission: Submission, dest_path: Path) -> None:
        """
        GET /api/grader/submissions/[id]/tarball
        """
        r = self._get(
            f"/api/grader/submissions/{submission.id}/tarball",
            stream=True,
        )

        with open(dest_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)

    def submit_result(
        self,
        submission: Submission,
        *,
        passed: bool,
        log_path: Path,
    ) -> None:
        """
        POST /api/grader/submissions/[id]/result
        multipart:
          - logs: file
          - passed: "true" | "false"
        """
        with open(log_path, "rb") as logf:
            files = {
                "logs": ("logs.txt", logf),
            }
            data = {
                "passed": "true" if passed else "false",
            }

            self._post(
                f"/api/grader/submissions/{submission.id}/result",
                files=files,
                data=data,
            )
