"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useMeetingFlow } from "@/components/meeting/meeting-context";
import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";

export default function RecordAudioPage() {
  const router = useRouter();
  const { meetingForm, setMeetingData, meetingId } = useMeetingFlow();

  const [mode, setMode] = useState<"record" | "upload" | null>(null);
  const { isRecording, elapsed, startRecording, stopRecording } =
    useAudioRecorder();
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleFile = (file?: File) => {
    if (file) setUploaded(file.name);
  };

  const handleNext = () => {
    if (meetingForm) {
      setMeetingData({ ...meetingForm, audioLength: elapsed || 180 });
      router.push(`/meetings/${meetingId}/transcript`);
    }
  };

  const canProceed =
    (mode === "record" && elapsed > 0 && !isRecording) ||
    (mode === "upload" && uploaded);

  return (
    <div className="w-full px-6 md:px-12 py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-[clamp(2rem,6vw,4rem)] font-bold uppercase leading-[0.85] tracking-tighter mb-2">
          Audio Input
        </div>
        <p className="text-lg text-muted-foreground mb-4">
          <span className="text-primary font-bold">
            {meetingForm?.title || "New Meeting"}
          </span>
          {" · "}
          {meetingForm?.date || "Today"}
        </p>

        {/* Mode Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            type="button"
            onClick={() => setMode("record")}
            className={`border-2 p-8 text-left transition-all ${
              mode === "record"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <span className="text-[clamp(2rem,4vw,3rem)] block mb-3">🎤</span>
            <span className="block font-bold uppercase tracking-tighter text-xl">
              Record Live
            </span>
            <span className="block text-sm text-muted-foreground mt-1">
              Use your microphone
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`border-2 p-8 text-left transition-all ${
              mode === "upload"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <span className="text-[clamp(2rem,4vw,3rem)] block mb-3">📁</span>
            <span className="block font-bold uppercase tracking-tighter text-xl">
              Upload File
            </span>
            <span className="block text-sm text-muted-foreground mt-1">
              MP3, WAV, M4A, OGG
            </span>
          </button>
        </div>

        {mode === "record" && (
          <div className="border-2 border-border p-12 text-center">
            {isRecording && (
              <div className="flex justify-center gap-1.5 mb-6 h-[40px] items-end">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-primary animate-pulse"
                    style={{
                      height: `${Math.random() * 20 + 10}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}

            <div
              className={`font-bold text-[clamp(2rem,6vw,5rem)] mb-8 font-mono ${isRecording ? "text-primary" : "text-foreground"}`}
            >
              {fmt(elapsed)}
            </div>

            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-105 border-2 ${
                isRecording
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-foreground border-border hover:border-primary"
              }`}
            >
              {isRecording ? (
                <span className="block w-8 h-8 bg-current" />
              ) : (
                <span className="text-4xl">●</span>
              )}
            </button>
            <p className="text-sm text-muted-foreground mt-5 font-bold uppercase tracking-wider">
              {isRecording ? "Click to stop" : "Click to start recording"}
            </p>
          </div>
        )}

        {mode === "upload" && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handleFile(e.dataTransfer.files[0]);
            }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed p-16 text-center cursor-pointer transition-all ${
              dragging
                ? "border-primary bg-primary/5"
                : uploaded
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
            />
            {uploaded ? (
              <>
                <span className="text-[clamp(2rem,4vw,3rem)] block mb-4">
                  ✓
                </span>
                <p className="text-xl font-bold uppercase tracking-tighter text-primary">
                  {uploaded}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  File ready to process
                </p>
              </>
            ) : (
              <>
                <span className="text-[clamp(2rem,4vw,3rem)] block mb-4">
                  📂
                </span>
                <p className="text-xl font-bold uppercase tracking-tighter">
                  Drop Audio File Here
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  or click to browse · MP3, WAV, M4A, OGG
                </p>
              </>
            )}
          </div>
        )}

        {canProceed && (
          <div className="mt-8 flex justify-end">
            <Button onClick={handleNext} size="lg">
              Process Audio →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
