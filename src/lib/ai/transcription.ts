export interface TranscriptionResponse {
  transcript: string;
  language: string;
  duration?: number;
}

export async function transcribeAudio(
  audioUrl: string,
  meetingId: string,
  audioFileId: string,
): Promise<TranscriptionResponse> {
  const whisperServiceUrl = process.env.WHISPER_SERVICE_URL;

  if (!whisperServiceUrl) {
    throw new Error("Transcription service configuration error");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

  try {
    const response = await fetch(whisperServiceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        meeting_id: meetingId,
        audio_file_id: audioFileId,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 503) {
        throw new Error("Transcription service temporarily unavailable");
      }
      const _errorText = await response.text();
      throw new Error(`Transcription service error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.text) {
      throw new Error(
        "Invalid transcription response: missing transcript text",
      );
    }

    return {
      transcript: data.text,
      language: data.language || "unknown",
      duration: data.duration,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Transcription request timed out");
      }
      throw error;
    }
    throw new Error("Transcription failed due to an unexpected error");
  }
}
