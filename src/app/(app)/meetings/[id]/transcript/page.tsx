"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { transcribeAudio } from "@/actions/transcribe";
import { useMeetingFlow } from "@/components/meeting/meeting-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

export default function TranscriptPage() {
  const router = useRouter();
  const { meetingData, setMeetingData, meetingId } = useMeetingFlow();

  const [step, setStep] = useState<"processing" | "review">("processing");
  const [progress, setProgress] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [edited, setEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (step !== "processing") return;

    const processAudio = async () => {
      if (!meetingData?.audioFileId) {
        setError("Audio file not found. Please try again.");
        setStep("review");
        return;
      }

      const iv = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) {
            clearInterval(iv);
            return 90;
          }
          return p + Math.random() * 10 + 5;
        });
      }, 300);

      if (!meetingId) {
        setError("Meeting ID not found. Please try again.");
        setStep("review");
        return;
      }

      try {
        const result = await transcribeAudio(
          meetingId,
          meetingData.audioFileId,
        );

        clearInterval(iv);
        setProgress(100);

        if (result.success && result.transcript_text) {
          setTranscript(result.transcript_text);
          setMeetingData({
            ...meetingData,
            transcript: result.transcript_text,
          });
          setTimeout(() => setStep("review"), 500);
        } else {
          setError(
            result.error || "Unable to process audio. Please try again.",
          );
          setStep("review");
        }
      } catch (_err) {
        clearInterval(iv);
        setError(
          "Unable to connect to transcription service. Please try again later.",
        );
        setStep("review");
      }
    };

    processAudio();
  }, [step, meetingId, meetingData, setMeetingData]);

  const handleNext = () => {
    if (meetingData) {
      setMeetingData({ ...meetingData, transcript });
      router.push(`/meetings/${meetingId}/mom`);
    }
  };

  if (step === "processing") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center max-w-lg w-full">
          <div className="text-[clamp(3rem,8vw,5rem)] font-bold uppercase leading-none text-primary mb-6">
            Transcribing
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Converting speech to text using Faster-Whisper
          </p>
          <Progress value={progress} className="h-2 mb-3" />
          <p className="font-bold text-primary font-mono text-lg">
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 md:px-12 py-12 md:py-20 min-h-screen flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1">
        <div className="text-[clamp(2rem,6vw,4rem)] font-bold uppercase leading-[0.85] tracking-tighter mb-2">
          Review Transcript
        </div>
        <p className="text-lg text-muted-foreground mb-8">
          Check the transcript and correct errors before generating MoM.
          {edited && (
            <Badge variant="secondary" className="ml-3">
              Edited
            </Badge>
          )}
          {error && (
            <Badge variant="destructive" className="ml-3">
              {error}
            </Badge>
          )}
        </p>

        <div className="flex-1 border-2 border-border p-6 md:p-8 mb-6 flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
              Transcript
            </span>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              {transcript.split(/\s+/).length} words
            </span>
          </div>
          <Textarea
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              setEdited(true);
            }}
            className="flex-1 min-h-[400px] border-none p-0 text-lg leading-relaxed resize-none"
          />
        </div>

        <div className="flex justify-between items-center shrink-0">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push(`/meetings/${meetingId}/record`)}
          >
            ← Back
          </Button>
          <Button onClick={handleNext} size="lg">
            Generate MoM →
          </Button>
        </div>
      </div>
    </div>
  );
}
