"use client";

<<<<<<< HEAD
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useMeetingFlow } from "@/components/meeting/meeting-context"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { transcribeMeeting } from "@/actions/transcribe"
import { toast } from "sonner"

export default function RecordAudioPage() {
  const router = useRouter()
  const { meetingForm, setMeetingData } = useMeetingFlow()

  const [mode, setMode] = useState<"record" | "upload" | null>(null)
  const { isRecording, elapsed, startRecording, stopRecording } = useAudioRecorder()
  const [uploaded, setUploaded] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
=======
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMeetingFlow } from "@/components/meeting/meeting-context";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";

export default function RecordAudioPage() {
  const router = useRouter();
  const { meetingForm, setMeetingData, meetingId } = useMeetingFlow();
>>>>>>> cb526a3426f13935f89030522b06e3acf0ae77f7

  const [mode, setMode] = useState<"record" | "upload" | null>(null);
  const { isRecording, elapsed, startRecording, stopRecording } =
    useAudioRecorder();
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleFile = (file?: File) => {
<<<<<<< HEAD
    if (file) setUploaded(file)
  }

  const handleNext = async () => {
    if (!meetingForm) return
    setMeetingData({ ...meetingForm, audioLength: elapsed || 180 })
    setSubmitting(true)
    try {
      const result = await transcribeMeeting("draft-1")
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Transcription started")
        router.push(`/meetings/draft-1/transcript`)
      }
    } catch {
      toast.error("Failed to start transcription")
    } finally {
      setSubmitting(false)
=======
    if (file) setUploaded(file.name);
  };

  const handleNext = () => {
    if (meetingForm) {
      setMeetingData({ ...meetingForm, audioLength: elapsed || 180 });
      router.push(`/meetings/${meetingId}/transcript`);
>>>>>>> cb526a3426f13935f89030522b06e3acf0ae77f7
    }
  };

<<<<<<< HEAD
  const canProceed = (mode === "record" && elapsed > 0 && !isRecording) || (mode === "upload" && !!uploaded)

  return (
    <div className="p-8 md:p-10 max-w-3xl mx-auto w-full">
      <button
        onClick={() => router.push("/meetings/new")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium mb-8 dark:hover:text-slate-200"
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back
      </button>

      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Audio Input</h2>
        <p className="text-[14px] text-slate-500 mt-1.5">
          <strong className="text-blue-600 dark:text-blue-400">{meetingForm?.title || "New Meeting"}</strong> · {meetingForm?.date || "Today"}
=======
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
>>>>>>> cb526a3426f13935f89030522b06e3acf0ae77f7
        </p>

<<<<<<< HEAD
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {[
          { key: "record" as const, label: "Record Live", desc: "Use your microphone", icon: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" },
          { key: "upload" as const, label: "Upload File", desc: "MP3, WAV, M4A, OGG", icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" },
        ].map(opt => (
          <Card
            key={opt.key}
            onClick={() => setMode(opt.key)}
            className={`cursor-pointer border-2 transition-all p-6 ${mode === opt.key ? "border-blue-600 bg-blue-600/5 dark:border-blue-500 dark:bg-blue-500/10 shadow-sm" : "border-slate-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700"}`}
          >
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke={mode === opt.key ? "currentColor" : "#94a3b8"} strokeWidth="1.8" className={`mb-3 ${mode === opt.key ? "text-blue-600 dark:text-blue-400" : ""}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d={opt.icon} />
            </svg>
            <p className={`text-[15px] font-semibold mb-1 ${mode === opt.key ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-white"}`}>{opt.label}</p>
            <p className="text-[13px] text-slate-500">{opt.desc}</p>
          </Card>
        ))}
      </div>

      {mode === "record" && (
        <Card className="p-10 border-slate-100 dark:border-slate-800 text-center shadow-sm max-w-lg mx-auto">
          {isRecording && (
            <div className="flex justify-center gap-1.5 mb-6 h-[40px] items-end">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className="w-1.5 rounded-full bg-red-500 animate-pulse"
                  style={{ height: `${Math.random() * 20 + 10}px`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          )}

          <p className={`font-mono text-5xl font-medium mb-8 ${isRecording ? "text-red-500" : "text-slate-900 dark:text-white"}`}>
            {fmt(elapsed)}
          </p>

          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-transform hover:scale-105 shadow-md ${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"}`}
=======
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
>>>>>>> cb526a3426f13935f89030522b06e3acf0ae77f7
          >
            <span className="text-[clamp(2rem,4vw,3rem)] block mb-3">📁</span>
            <span className="block font-bold uppercase tracking-tighter text-xl">
              Upload File
            </span>
            <span className="block text-sm text-muted-foreground mt-1">
              MP3, WAV, M4A, OGG
            </span>
          </button>
<<<<<<< HEAD
          <p className="text-sm text-slate-500 mt-5">{isRecording ? "Click to stop recording" : "Click to start recording"}</p>
        </Card>
      )}

      {mode === "upload" && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all max-w-lg mx-auto ${dragging ? "border-blue-600 bg-blue-600/5" : uploaded ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : "border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"}`}
        >
          <input ref={fileRef} type="file" accept="audio/*" onChange={e => handleFile(e.target.files?.[0])} className="hidden" />
          {uploaded ? (
            <>
              <svg width="42" height="42" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth="1.8" className="mx-auto mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[16px] font-semibold text-emerald-800 dark:text-emerald-400">{uploaded.name}</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1.5">File ready to process</p>
            </>
          ) : (
            <>
              <svg width="42" height="42" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" className="mx-auto mb-4 text-indigo-400 dark:text-indigo-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-[16px] font-semibold text-indigo-900 dark:text-indigo-300">Drop audio file here</p>
              <p className="text-sm text-indigo-500 dark:text-indigo-400 mt-1.5">or click to browse · MP3, WAV, M4A, OGG</p>
            </>
          )}
=======
>>>>>>> cb526a3426f13935f89030522b06e3acf0ae77f7
        </div>

<<<<<<< HEAD
      {canProceed && (
        <div className="mt-8 flex justify-center sm:justify-start">
          <Button onClick={handleNext} disabled={submitting} className="h-12 px-8 rounded-xl font-semibold shadow-sm w-full sm:w-auto">
            {submitting ? "Processing…" : "Process Audio"}
            {!submitting && (
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
=======
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
>>>>>>> cb526a3426f13935f89030522b06e3acf0ae77f7
