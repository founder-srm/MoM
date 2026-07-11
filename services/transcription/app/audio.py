import os
import tempfile
from pathlib import Path
from urllib.parse import urlparse

import httpx

from app.config import settings
from app.errors import TranscriptionServiceError


def _suffix_from_url(audio_url: str) -> str:
    suffix = Path(urlparse(audio_url).path).suffix
    return suffix if suffix else ".audio"


async def download_audio_to_tempfile(audio_url: str) -> str:
    max_bytes = settings.max_audio_mb * 1024 * 1024
    suffix = _suffix_from_url(audio_url)
    temp_fd, temp_path = tempfile.mkstemp(suffix=suffix)
    temp_file = os.fdopen(temp_fd, "wb")
    bytes_written = 0

    try:
        with temp_file:
            async with httpx.AsyncClient(
                timeout=settings.audio_download_timeout_seconds,
                follow_redirects=True,
            ) as client:
                async with client.stream("GET", audio_url) as response:
                    response.raise_for_status()

                    async for chunk in response.aiter_bytes():
                        bytes_written += len(chunk)
                        if bytes_written > max_bytes:
                            raise TranscriptionServiceError(
                                code="AUDIO_TOO_LARGE",
                                message=f"Audio file exceeds {settings.max_audio_mb} MB.",
                                status_code=413,
                            )
                        temp_file.write(chunk)

        if bytes_written == 0:
            raise TranscriptionServiceError(
                code="AUDIO_DOWNLOAD_FAILED",
                message="Downloaded audio file is empty.",
                status_code=400,
            )

        return temp_path
    except httpx.HTTPStatusError as error:
        cleanup_tempfile(temp_path)
        raise TranscriptionServiceError(
            code="AUDIO_DOWNLOAD_FAILED",
            message=f"Audio download failed with status {error.response.status_code}.",
            status_code=400,
        ) from error
    except httpx.HTTPError as error:
        cleanup_tempfile(temp_path)
        raise TranscriptionServiceError(
            code="AUDIO_DOWNLOAD_FAILED",
            message="Audio download failed.",
            status_code=400,
        ) from error
    except Exception:
        cleanup_tempfile(temp_path)
        raise


def cleanup_tempfile(temp_path: str | None) -> None:
    if not temp_path:
        return

    try:
        os.unlink(temp_path)
    except FileNotFoundError:
        pass
