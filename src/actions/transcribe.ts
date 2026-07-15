"use server";

export async function transcribeAudio(
  meetingId: string,
  audioFileId: string,
): Promise<{ success: boolean; transcript_text?: string; error?: string }> {
  try {
    const response = await fetch("/api/transcribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        meeting_id: meetingId,
        audio_file_id: audioFileId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Transcription failed",
      };
    }

    return {
      success: true,
      transcript_text: data.transcript_text,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Transcription failed",
    };
  }
}
