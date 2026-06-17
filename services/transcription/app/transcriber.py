from faster_whisper import WhisperModel

from app.config import settings
from app.errors import TranscriptionServiceError
from app.schemas import TranscriptSegment, TranscribeResponse

_model: WhisperModel | None = None


def load_model() -> WhisperModel:
    global _model

    if _model is None:
        _model = WhisperModel(
            settings.model_name,
            device=settings.device,
            compute_type=settings.compute_type,
        )

    return _model


def get_model() -> WhisperModel:
    if _model is None:
        return load_model()

    return _model


def transcribe_file(audio_path: str) -> TranscribeResponse:
    try:
        model = get_model()
        segments, info = model.transcribe(audio_path)
        transcript_segments = [
            TranscriptSegment(
                start=segment.start,
                end=segment.end,
                text=segment.text.strip(),
            )
            for segment in segments
        ]
        text = " ".join(segment.text for segment in transcript_segments).strip()

        return TranscribeResponse(
            text=text,
            language=info.language or "unknown",
            segments=transcript_segments,
        )
    except Exception as error:
        raise TranscriptionServiceError(
            code="TRANSCRIPTION_FAILED",
            message="Audio transcription failed.",
            status_code=500,
        ) from error
