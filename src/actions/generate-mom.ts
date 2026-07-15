"use server";

import type { StructuredOutput } from "@/lib/ai/summarization";

export async function generateMom(
  transcript: string,
  meetingTitle: string,
  participants: string,
  agenda: string,
): Promise<{ success: boolean; mom?: StructuredOutput; error?: string }> {
  try {
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transcript,
        meetingTitle,
        participants,
        agenda,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "MoM generation failed",
      };
    }

    return {
      success: true,
      mom: data as StructuredOutput,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "MoM generation failed",
    };
  }
}
