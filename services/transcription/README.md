# Transcription Service

FastAPI service for the Speech-to-Text pipeline.

Phase 1 currently includes the service scaffold, health endpoint, and Faster-Whisper model initialization. Transcription endpoints are not implemented yet.

## Setup

Create and activate a virtual environment:

```bash
cd services/transcription
python -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a local environment file:

```bash
cp .env.example .env
```

Optional model settings:

```env
TRANSCRIPTION_MODEL=small
TRANSCRIPTION_DEVICE=cpu
TRANSCRIPTION_COMPUTE_TYPE=int8
MAX_AUDIO_MB=100
AUDIO_DOWNLOAD_TIMEOUT_SECONDS=60
```

## Run Locally

Start the development server:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

The Faster-Whisper model loads once during application startup. The first run may download the selected model, so startup can take longer than usual.

## Health Check

Open this URL in a browser:

```text
http://127.0.0.1:8001/health
```

Or test with curl:

```bash
curl http://127.0.0.1:8001/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "transcription"
}
```

If the server starts successfully and `/health` responds, the model initialized successfully during startup.

## Transcribe

The `/transcribe` endpoint accepts a JSON body with an audio URL and returns transcript text plus timestamped segments.

```bash
curl -X POST http://127.0.0.1:8001/transcribe \
  -H "Content-Type: application/json" \
  -d '{
    "audio_url": "https://example.com/sample.mp3",
    "meeting_id": "meeting-1",
    "audio_file_id": "audio-1"
  }'
```

Expected response shape:

```json
{
  "text": "Transcript text",
  "language": "en",
  "segments": [
    {
      "start": 0.0,
      "end": 2.5,
      "text": "Transcript text"
    }
  ]
}
```
