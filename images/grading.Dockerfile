FROM debian:trixie
RUN apt-get update

RUN apt-get install -y --no-install-recommends \
    tini \
    bash \
    coreutils \
    qemu-system-x86 \
    qemu-system-aarch64 \
    ovmf \
    qemu-efi-aarch64 \
    util-linux \
    curl \
    ca-certificates \
    vim \
    python3 \
    procps

WORKDIR /workspace
COPY grade.py /grade.py

CMD ["/grade.py"]
