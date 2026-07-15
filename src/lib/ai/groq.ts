export interface SummarizeInput {
  transcript: string;
  meetingTitle: string;
  participants: string;
  agenda: string;
}

export interface StructuredOutput {
  executive_summary: string;
  meeting_summary: string;
  highlights: string[];
  decisions: string[];
  action_items: Array<{
    task: string;
    owner: string;
    deadline?: string;
  }>;
  risks: string[];
  sop: string[];
}

export async function generateSummary(
  input: SummarizeInput,
): Promise<StructuredOutput> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are a meeting analysis assistant. Return ONLY valid JSON. No markdown, no extra text, no explanations. JSON must match this exact schema: {executive_summary: string, meeting_summary: string, highlights: string[], decisions: string[], action_items: Array<{task: string, owner: string, deadline?: string}>, risks: string[], sop: string[]}",
            },
            {
              role: "user",
              content: `Analyze this meeting transcript and return JSON only.

Meeting Title: ${input.meetingTitle}
Participants: ${input.participants}
Agenda: ${input.agenda}

Transcript:
${input.transcript}

Return JSON with keys: executive_summary, meeting_summary, highlights, decisions, action_items, risks, sop. No markdown formatting.`,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(
          "AI service rate limit reached. Please try again later.",
        );
      }
      const _errorText = await response.text();
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from AI service");
    }

    try {
      const parsed = JSON.parse(content) as StructuredOutput;

      // Validate required fields
      if (
        !parsed.executive_summary ||
        !parsed.meeting_summary ||
        !Array.isArray(parsed.highlights)
      ) {
        throw new Error("Invalid response structure from AI service");
      }

      return parsed;
    } catch {
      throw new Error("Invalid response format from AI service");
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("AI service request timed out");
      }
      throw error;
    }
    throw new Error("AI service temporarily unavailable");
  }
}
