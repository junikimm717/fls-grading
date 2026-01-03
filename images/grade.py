#!/usr/bin/env python3

import re
import secrets
import subprocess
import sys
import time
from pathlib import Path
from typing import Callable, Sequence

# -------------------------
# Configuration
# -------------------------

IMAGE = Path(sys.argv[1])
ARCH = subprocess.check_output(["uname", "-m"], text=True).strip()

PROMPT_RE = re.compile(r"#\s*$")
LOGIN_RE = re.compile(r"login:")

PID_RE = re.compile(r"^\d+$")


# -------------------------
# QEMU command
# -------------------------


def build_qemu_cmd(image: Path) -> list[str]:
    if "x86" in ARCH:
        return [
            "qemu-system-x86_64",
            "-machine",
            "q35",
            "-m",
            "1024",
            "-nographic",
            "-drive",
            "if=pflash,format=raw,readonly=on,file=/usr/share/OVMF/OVMF_CODE_4M.fd",
            "-drive",
            "if=pflash,format=raw,file=/usr/share/OVMF/OVMF_VARS_4M.fd",
            "-drive",
            f"if=virtio,format=raw,file={image}",
            "-serial",
            "mon:stdio",
            "-netdev",
            "user,id=net0",
            "-device",
            "virtio-net-pci,netdev=net0",
        ]
    else:
        return [
            "qemu-system-aarch64",
            "-machine",
            "virt",
            "-cpu",
            "cortex-a72",
            "-m",
            "1024",
            "-nographic",
            "-drive",
            "if=pflash,format=raw,readonly=on,file=/usr/share/AAVMF/AAVMF_CODE.fd",
            "-drive",
            "if=pflash,format=raw,file=/usr/share/AAVMF/AAVMF_VARS.fd",
            "-drive",
            f"if=virtio,format=raw,file={image}",
            "-serial",
            "mon:stdio",
            "-netdev",
            "user,id=net0",
            "-device",
            "virtio-net-pci,netdev=net0",
        ]


# -------------------------
# Failure handling
# -------------------------


class TestFailure(Exception):
    pass


def fail(msg: str) -> None:
    raise TestFailure(msg)


# -------------------------
# VM abstraction
# -------------------------


class VM:
    def __init__(self, image: Path):
        self.image = image
        self.proc: subprocess.Popen | None = None

    def start(self) -> None:
        self.proc = subprocess.Popen(
            build_qemu_cmd(self.image),
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )
        assert self.proc.stdin and self.proc.stdout

        boot_lines: list[str] = []
        self._wait_for(LOGIN_RE, 30, boot_lines)
        test_kernel_logs(boot_lines)

        self.getoutput("root")
        self.getoutput("export TERM=dumb")
        self.getoutput("unset LS_COLORS")

    def _wait_for(
        self, pattern: re.Pattern, timeout: int, lines: list[str] | None = None
    ) -> None:
        assert self.proc and self.proc.stdout
        start = time.time()
        buf = ""

        while True:
            if time.time() - start > timeout:
                raise TimeoutError(f"timeout waiting for {pattern.pattern}")

            ch = self.proc.stdout.read(1)
            if not ch:
                continue

            sys.stdout.write(ch)
            sys.stdout.flush()

            buf += ch

            while "\n" in buf:
                line, buf = buf.split("\n", 1)
                if lines is not None:
                    lines.append(line)

            if pattern.search(buf):
                return

    def getoutput(self, cmd: str, timeout: int = 5) -> list[str]:
        assert self.proc and self.proc.stdin
        lines: list[str] = []
        self.proc.stdin.write(cmd + "\n")
        self.proc.stdin.flush()
        self._wait_for(PROMPT_RE, timeout, lines)
        return lines[1:]  # drop echoed command

    def shutdown(self) -> None:
        assert self.proc and self.proc.stdin
        self.proc.stdin.write("poweroff\n")
        self.proc.stdin.flush()
        self.proc.wait(timeout=20)

    def close(self) -> None:
        if self.proc:
            self.proc.kill()
            self.proc.wait()
            self.proc = None

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, exc_type, exc, tb):
        try:
            if self.proc:
                self.shutdown()
        except Exception:
            self.close()


# -------------------------
# Test framework
# -------------------------


class Test:
    def run(self, vm: VM) -> None:
        raise NotImplementedError


class CommandTest(Test):
    def __init__(self, cmd: str, check: Callable[[list[str]], None]):
        self.cmd = cmd
        self.check = check

    def run(self, vm: VM) -> None:
        out = vm.getoutput(self.cmd)
        self.check(out)


class SyncPoint(Test):
    def __init__(self, fn: Callable[[VM], None]):
        self.fn = fn

    def run(self, vm: VM) -> None:
        self.fn(vm)


# -------------------------
# Test helpers
# -------------------------


def test_kernel_logs(lines: list[str]) -> None:
    text = "\n".join(lines)
    if not re.search(
        r"Linux version|Kernel command line|Run /init as init process|\[\s*0\.", text
    ):
        fail("no kernel boot logs detected before login")


def test_ls(out: list[str]) -> None:
    required = {"bin", "usr", "etc", "proc", "sys", "dev"}
    missing = required - set(out)
    if missing:
        fail(f"missing directories in /: {', '.join(sorted(missing))}")


def test_mount(out: list[str]) -> None:
    def has(fs: str, mp: str) -> bool:
        return any(fs in l and mp in l for l in out)

    if not has("proc", "/proc"):
        fail("/proc not mounted")
    if not has("sysfs", "/sys"):
        fail("/sys not mounted")
    if not any(("devtmpfs" in l or "tmpfs" in l) and "/dev" in l for l in out):
        fail("/dev not mounted")


def require_pids(out: list[str], name: str) -> None:
    if not any(PID_RE.fullmatch(l) for l in out):
        fail(f"{name} not running")


def wait_for_default_route(vm: VM, timeout: int = 20) -> None:
    start = time.time()
    while time.time() - start < timeout:
        out = vm.getoutput("ip route show")
        if any(l.startswith("default ") for l in out):
            return
        time.sleep(2)
    fail("no default route installed")


def test_ping(out: list[str]) -> None:
    text = "\n".join(out)
    if "bytes from" not in text and "0% packet loss" not in text:
        fail("ping failed")


def test_time(out: list[str]) -> None:
    try:
        if int(out[0]) < 2025:
            fail("system time not set")
    except Exception:
        fail("failed to read system time")


def test_persistence(out: list[str]) -> None:
    if out != ["hello"]:
        fail("persistence test failed")


# -------------------------
# Test suites
# -------------------------

filename = f"{secrets.token_hex(5)}.txt"

test1 = [
    CommandTest("ls -1 /", test_ls),
    CommandTest("mount", test_mount),
    CommandTest("pgrep udevd", lambda o: require_pids(o, "eudev")),
    CommandTest("pgrep dhcpcd", lambda o: require_pids(o, "dhcpcd")),
    CommandTest("pgrep chronyd || pgrep chrony", lambda o: require_pids(o, "chrony")),
    SyncPoint(wait_for_default_route),
    CommandTest("ping -c 2 1.1.1.1", test_ping),
    CommandTest("date +%Y", test_time),
    CommandTest(f"echo hello > /{filename}", lambda _: None),
    CommandTest("sync", lambda _: None),
]

test2 = [CommandTest(f"grep -x hello /{filename}", test_persistence)]


# -------------------------
# Runner
# -------------------------


def run_suite(tests: Sequence[Test]) -> None:
    with VM(IMAGE) as vm:
        for t in tests:
            t.run(vm)


if __name__ == "__main__":
    try:
        run_suite(test1)
        run_suite(test2)
        print("\n>>>> PASSED!")
    except TestFailure as e:
        print(f"\n>>>> FAIL: {e}")
        sys.exit(1)
