"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { MomRenderer } from "@/components/meeting/mom-renderer";
import type { Database } from "@/lib/types/database";

type Meeting = Database["public"]["Tables"]["meetings"]["Row"];

export default function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedId = React.use(params).id;

  const [tab, setTab] = useState<"mom" | "summary">("mom");
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMeeting() {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await fetch(`/api/meetings/${resolvedId}`);
      const result = await response.json();

      if (!isMounted) return;

      if (!response.ok) {
        setErrorMessage(result.error || "Failed to load meeting");
        setIsLoading(false);
        return;
      }

      setMeeting(result);
      setIsLoading(false);
    }

    loadMeeting();

    return () => {
      isMounted = false;
    };
  }, [resolvedId]);

  const copy = () => {
    navigator.clipboard?.writeText(meeting?.description || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "No date";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "No date";

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="w-full px-6 md:px-12 py-12 md:py-20">
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="border-2 border-border p-12 text-center">
            <p className="text-xl font-bold uppercase tracking-tighter text-muted-foreground">
              Loading meeting
            </p>
          </div>
        ) : errorMessage || !meeting ? (
          <div className="border-2 border-border p-12 text-center">
            <p className="text-xl font-bold uppercase tracking-tighter text-destructive">
              {errorMessage || "Meeting not found"}
            </p>
          </div>
        ) : (
          <>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
          <div>
            <div className="text-[clamp(2rem,6vw,4rem)] font-bold uppercase leading-[0.85] tracking-tighter mb-3">
              {meeting.title}
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span>{formatDate(meeting.date)}</span>
              {meeting.participants && <span>{meeting.participants}</span>}
              <StatusBadge status={meeting.status || "unknown"} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={copy}>
              {copied ? "Copied!" : "Copy MoM"}
            </Button>
            <Button size="sm" onClick={() => router.push("/dashboard")}>
              Dashboard →
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-2 border-border mb-8">
          {(["mom", "summary"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 py-4 font-bold uppercase tracking-wider text-sm transition-colors ${
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "mom" ? "Minutes of Meeting" : "AI Summary"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="border-2 border-border p-8 min-h-[400px]">
          {tab === "summary" ? (
            <p className="text-lg leading-relaxed text-muted-foreground">
              {meeting.description || "No summary has been generated yet."}
            </p>
          ) : meeting.description ? (
            <MomRenderer text={meeting.description} />
          ) : (
            <p className="text-lg leading-relaxed text-muted-foreground">
              No minutes have been generated yet.
            </p>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
}
