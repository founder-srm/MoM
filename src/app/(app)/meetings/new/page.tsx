"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMeetingFlow } from "@/components/meeting/meeting-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewMeetingPage() {
  const router = useRouter();
  const { meetingForm, setMeetingForm, setMeetingId } = useMeetingFlow();

  const [title, setTitle] = useState(meetingForm?.title || "");
  const [date, setDate] = useState(
    meetingForm?.date || new Date().toISOString().split("T")[0],
  );
  const [participants, setParticipants] = useState(
    meetingForm?.participants || "",
  );
  const [agenda, setAgenda] = useState(meetingForm?.agenda || "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (!title) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    const meetingPayload = {
      title,
      date,
      description: agenda,
      participants,
    };

    const response = await fetch("/api/meetings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(meetingPayload),
    });

    const result = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setErrorMessage(result.error || "Failed to create meeting");
      return;
    }

    setMeetingForm({
      ...meetingForm,
      title,
      date,
      participants,
      agenda,
    });

    setMeetingId(result.meeting_id);
    router.push(`/meetings/${result.meeting_id}/record`);
  };

  return (
    <div className="w-full px-6 md:px-12 py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-[clamp(2rem,6vw,4rem)] font-bold uppercase leading-[0.85] tracking-tighter mb-2">
          New Meeting
        </div>
        <p className="text-lg text-muted-foreground mb-12">
          Set up your meeting details
        </p>

        <div className="space-y-8 border-2 border-border p-8 md:p-12">
          <div>
            <label
              htmlFor="title"
              className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3"
            >
              Meeting Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q2 Sprint Planning"
            />
          </div>

          <div>
            <label
              htmlFor="date"
              className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3"
            >
              Date
            </label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="participants"
              className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3"
            >
              Participants
            </label>
            <Input
              id="participants"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="e.g. Aryan, Priya, Rahul"
            />
          </div>

          <div>
            <label
              htmlFor="agenda"
              className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3"
            >
              Agenda / Description
            </label>
            <Textarea
              id="agenda"
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="What topics will be covered?"
              className="min-h-[160px]"
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              disabled={!title || isSubmitting}
              size="lg"
              className="flex-1"
            >
              {isSubmitting ? "Creating..." : "Continue to Audio →"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
