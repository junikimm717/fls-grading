import platform

from .models import Arch

def detect_arch() -> Arch:
    arch = platform.machine()

    if arch == "x86_64":
        return "x86_64"
    if arch in ("aarch64", "arm64"):
        return "aarch64"

    raise RuntimeError(f"unsupported architecture: {arch}")
