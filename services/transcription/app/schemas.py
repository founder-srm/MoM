from pydantic import BaseModel, HttpUrl


class TranscribeRequest(BaseModel):
    audio_url: HttpUrl
    meeting_id: str
    audio_file_id: str


class TranscriptSegment(BaseModel):
    start: float
    end: float
    text: str


class TranscribeResponse(BaseModel):
    text: str
    language: str
    segments: list[TranscriptSegment]
