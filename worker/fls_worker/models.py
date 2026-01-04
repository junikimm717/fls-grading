from dataclasses import dataclass
from datetime import datetime
from typing import Literal


Arch = Literal["x86_64", "aarch64"]


@dataclass(frozen=True)
class Submission:
    id: int
    user_id: str
    tarball: str
    arch: Arch
    created_at: datetime

    @classmethod
    def from_json(cls, data: dict) -> "Submission":
        return cls(
            id=int(data["id"]),
            user_id=data["userId"],
            tarball=data["tarball"],
            arch=data["arch"],
            created_at=datetime.fromisoformat(
                data["createdAt"].replace("Z", "+00:00")
            ),
        )
