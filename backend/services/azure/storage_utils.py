"""Small helpers for Azure blob naming and credential parsing."""

import os


def get_result_filename(job_id: str) -> str:
    """Return the standardized result filename for a job."""
    return f"{os.path.basename(job_id)}.png"


def get_upload_filename(job_id: str, ext: str) -> str:
    """Return the standardized upload filename for a job and extension."""
    return f"{os.path.basename(job_id)}.{ext}"


def get_marker_filename(job_id: str) -> str:
    """Return the standardized failure marker path for a job."""
    return f"failed/{os.path.basename(job_id)}.txt"


def parse_azure_credentials(
    connection_string: str,
) -> tuple[str | None, str | None]:
    """Extract Azure account name and account key from a connection string.

    Args:
        connection_string:
            Azure Storage connection string.

    Returns:
        tuple[str | None, str | None]:
            Account name and account key. Values may be ``None`` if missing.
    """
    parts = {
        k.lower(): v
        for k, v in (item.split("=", 1) for item in connection_string.split(";") if "=" in item)
    }
    return parts.get("accountname"), parts.get("accountkey")
