import json
import socket

import requests
from docker.errors import DockerException

from fls_worker.errors import (
    FLSAlreadyClaimedError,
    FLSAPIError,
    FLSAuthError,
    FLSBadResponseError,
    FLSNotFoundError,
)

INFRA_EXCEPTIONS = (
    # --- FLS / control plane ---
    FLSAPIError,
    FLSAuthError,
    FLSBadResponseError,
    FLSNotFoundError,
    FLSAlreadyClaimedError,
    # --- network / http ---
    requests.exceptions.RequestException,
    socket.timeout,
    TimeoutError,
    ConnectionError,
    BrokenPipeError,
    # --- docker ---
    DockerException,
    # --- resources ---
    MemoryError,
    # --- runtime / env ---
    RuntimeError,
    ImportError,
    ModuleNotFoundError,
    RecursionError,
    # --- lifecycle ---
    KeyboardInterrupt,
    SystemExit,
    # --- protocol / decoding ---
    ValueError,
    TypeError,
    KeyError,
    json.JSONDecodeError,
    # --- ipc ---
    EOFError,
)
