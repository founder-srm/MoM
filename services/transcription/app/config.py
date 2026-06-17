import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    model_name: str = os.getenv("TRANSCRIPTION_MODEL", "small")
    device: str = os.getenv("TRANSCRIPTION_DEVICE", "cpu")
    compute_type: str = os.getenv("TRANSCRIPTION_COMPUTE_TYPE", "int8")
    max_audio_mb: int = int(os.getenv("MAX_AUDIO_MB", "100"))
    audio_download_timeout_seconds: float = float(
        os.getenv("AUDIO_DOWNLOAD_TIMEOUT_SECONDS", "60")
    )


settings = Settings()
