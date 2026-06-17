# Transcription Service

FastAPI service for the Speech-to-Text pipeline.

Phase 1 currently includes only the service scaffold and health endpoint. Faster-Whisper and transcription are not implemented yet.

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

## Run Locally

Start the development server:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

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
