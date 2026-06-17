from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError

from app.audio import cleanup_tempfile, download_audio_to_tempfile
from app.errors import (
    TranscriptionServiceError,
    request_validation_error_handler,
    transcription_service_error_handler,
)
from app.schemas import TranscribeRequest, TranscribeResponse
from app.transcriber import load_model, transcribe_file


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield


app = FastAPI(
    title="MoM Transcription Service",
    version="0.1.0",
    lifespan=lifespan,
)
app.add_exception_handler(
    TranscriptionServiceError,
    transcription_service_error_handler,
)
app.add_exception_handler(
    RequestValidationError,
    request_validation_error_handler,
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "transcription",
    }


@app.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(request: TranscribeRequest) -> TranscribeResponse:
    temp_path: str | None = None

    try:
        temp_path = await download_audio_to_tempfile(str(request.audio_url))
        return transcribe_file(temp_path)
    finally:
        cleanup_tempfile(temp_path)
