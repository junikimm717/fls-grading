import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

"""
FLS_HOST_ROOT:
    Real host directory visible to the Docker daemon.

FLS_MOUNT_PREFIX:
    Path inside *this process* where host_root is mounted.
    Used for path translation when running inside a container.
"""

FLS_HOST_ROOT = Path(os.environ["FLS_HOST_ROOT"]).resolve()
FLS_MOUNT_PREFIX = Path(os.environ["FLS_MOUNT_PREFIX"]).resolve()

FLS_GRADING_SECRET = os.environ["FLS_GRADING_SECRET"]
FLS_GRADING_BASEURL = os.environ["FLS_GRADING_BASEURL"].rstrip("/")

# docker images for building and grading
FLS_GRADING_GRADER = os.environ["FLS_GRADING_GRADER"]
FLS_GRADING_BUILDER = os.environ["FLS_GRADING_BUILDER"]
