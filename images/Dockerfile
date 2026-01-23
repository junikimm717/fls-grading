FROM debian:bookworm
RUN apt-get update

# Core init + shell environment
# - tini: proper PID 1, signal handling
# - bash: predictable scripting semantics
# - coreutils: GNU userland (realpath, stat, timeout, etc.)
RUN apt-get install -y --no-install-recommends \
    tini \
    bash \
    coreutils \
# Toolchain and build systems
# - gcc / build-essential: C/C++ compilation
# - make / autotools / cmake: supported build systems
    gcc \
    build-essential \
    make \
    autoconf \
    automake \
    cmake \
    python3 \
# Binary inspection and low-level debugging
# - binutils: readelf, nm, objdump (ELF inspection)
# - strace: userspace syscall tracing (early userspace debugging)
# - file: identify binary formats
# - procps: inspecting and killing processes.
    binutils \
    strace \
    file \
    procps \
# Kernel and userspace build dependencies
# - libelf-dev: kernel build dependency
# - libncurses-dev: menuconfig
# - libssl-dev: kernel crypto / EFI
# - gperf, flex, bison, bc: common kernel / userspace build deps
    libelf-dev \
    libncurses-dev \
    libssl-dev \
    gperf \
    flex \
    bison \
    bc \
# Filesystem construction tools
# - e2fsprogs: ext4 filesystem creation + debugfs
# - dosfstools / mtools: FAT32 + EFI System Partition manipulation
# - gdisk: GPT partition table construction
# - fakeroot: filesystem ownership simulation during image creation
    e2fsprogs \
    dosfstools \
    mtools \
    gdisk \
    fakeroot \
# Archiving, compression, and synchronization
# - cpio: initramfs creation (newc format)
# - rsync: deterministic filesystem population
# - xz-utils / bzip2: source tarball compression formats
    cpio \
    rsync \
    xz-utils \
    bzip2 \
# Virtualization and firmware (QEMU)
# - qemu-system-*: VM execution for native architecture
# - ovmf / qemu-efi-aarch64: UEFI firmware for x86_64 and aarch64
    qemu-system-x86 \
    qemu-system-aarch64 \
    ovmf \
    qemu-efi-aarch64 \
# System inspection utilities
# - util-linux: lsblk, blkid, mount helpers (offline image inspection)
    util-linux \
# Networking and HTTPS support
# - curl: controlled source fetching (You may not assume the existence of a network connection during the build process)
# - ca-certificates: TLS trust store
    curl \
    ca-certificates \
# Editor (non-essential but pragmatic)
# - vim/nano: emergency edits and file viewing inside the container
    vim \
    nano

RUN mkdir -p /src/chrony && \
  curl -L https://chrony-project.org/releases/chrony-4.8.tar.gz \
  | tar -xz --strip-components=1 -C /src/chrony

RUN mkdir -p /src/dhcpcd && \
  curl -L \
  https://github.com/NetworkConfiguration/dhcpcd/releases/download/v10.3.0/dhcpcd-10.3.0.tar.xz \
  | tar -xJ --strip-components=1 -C /src/dhcpcd

RUN mkdir -p /src/eudev && \
  curl -L \
  https://github.com/eudev-project/eudev/releases/download/v3.2.14/eudev-3.2.14.tar.gz \
  | tar -xz --strip-components=1 -C /src/eudev

RUN mkdir -p /src/opendoas && \
  curl -L \
  https://github.com/Duncaen/OpenDoas/releases/download/v6.8.2/opendoas-6.8.2.tar.gz \
  | tar -xz --strip-components=1 -C /src/opendoas

RUN mkdir -p /src/kernel && \
  curl -L \
  https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.18.2.tar.xz \
  | tar -xJ --strip-components=1 -C /src/kernel

COPY musl.patch /patches/musl.patch
RUN mkdir -p /src/musl && \
  curl -L https://musl.libc.org/releases/musl-1.2.5.tar.gz \
  | tar -xz --strip-components=1 -C /src/musl && \
  patch -d /src/musl -p1 < /patches/musl.patch

COPY busybox.patch /patches/busybox.patch
RUN mkdir -p /src/busybox && \
  curl -L https://github.com/mirror/busybox/archive/refs/tags/1_36_1.tar.gz \
  | tar -xz --strip-components=1 -C /src/busybox && \
  patch -d /src/busybox -p1 < /patches/busybox.patch && \
  sed -i\
    -e "s|main|int main|g"\
    "/src/busybox/scripts/kconfig/lxdialog/check-lxdialog.sh"

WORKDIR /workspace
COPY ./devshell.sh /devshell.sh
COPY ./build-all-stages.sh /build-all-stages.sh

ENTRYPOINT ["/usr/bin/tini", "--"]

CMD ["/devshell.sh"]
