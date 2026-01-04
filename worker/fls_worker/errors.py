class FLSAPIError(RuntimeError):
    """Base class for API-related failures."""


class FLSAuthError(FLSAPIError):
    pass


class FLSNotFoundError(FLSAPIError):
    pass


class FLSConflictError(FLSAPIError):
    pass


class FLSBadResponseError(FLSAPIError):
    def __init__(self, status_code: int, body: str):
        super().__init__(f"HTTP {status_code}: {body}")
        self.status_code = status_code
        self.body = body

class FLSAlreadyClaimedError(FLSAPIError):
    pass

class DockerClientError(RuntimeError):
    pass
