"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { useMeetingFlow } from "@/components/meeting/meeting-context";
import { MOCK_MEETINGS } from "@/lib/mock-data";

export default function DashboardPage() {
  const router = useRouter();
  const { setMeetingForm } = useMeetingFlow();
  const [search, setSearch] = useState("");
  const [meetings] = useState(MOCK_MEETINGS);

  const filtered = meetings.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.participants.toLowerCase().includes(search.toLowerCase()),
  );

  const handleNewMeeting = () => {
    setMeetingForm(null);
    router.push("/meetings/new");
  };

  const handleMeetingClick = (meetingId: number) => {
    router.push(`/meetings/${meetingId}`);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="border-b-2 border-border px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-[95vw] md:max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <h1 className="text-[clamp(2.5rem,8vw,6rem)] font-bold uppercase leading-[0.85] tracking-tighter">
                Your Meetings
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mt-4">
                {meetings.length} meeting records saved
              </p>
            </div>
            <Button onClick={handleNewMeeting} size="lg">
              + New Meeting
            </Button>
          </div>

          {/* Search */}
          <div className="mt-12 max-w-xl">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search meetings or participants"
            />
          </div>
        </div>
      </div>

      {/* Stats Marquee */}
      <div className="border-b-2 border-border py-6 overflow-hidden bg-primary/5">
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-16 shrink-0">
              <div className="flex items-center gap-4">
                <span className="text-[clamp(2rem,5vw,4rem)] font-bold leading-none text-primary">
                  {meetings.length}
                </span>
                <span className="text-sm uppercase tracking-widest font-bold text-muted-foreground">
                  Total Meetings
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[clamp(2rem,5vw,4rem)] font-bold leading-none text-primary">
                  {meetings.filter((m) => m.status === "completed").length}
                </span>
                <span className="text-sm uppercase tracking-widest font-bold text-muted-foreground">
                  Completed
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[clamp(2rem,5vw,4rem)] font-bold leading-none text-muted-foreground">
                  ✦
                </span>
                <span className="text-sm uppercase tracking-widest font-bold text-muted-foreground">
                  AI Powered
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meetings List */}
      <div className="px-6 md:px-12 py-12 md:py-20">
        <div className="max-w-[95vw] md:max-w-6xl mx-auto">
          {filtered.length === 0 ? (
            <div className="border-2 border-border p-12 text-center">
              <div className="text-[clamp(4rem,10vw,8rem)] font-bold leading-none text-muted opacity-20 mb-6">
                {search ? "0" : "?"}
              </div>
              <p className="text-xl font-bold uppercase tracking-tighter text-muted-foreground">
                {search ? "No meetings found" : "No meetings yet"}
              </p>
              {!search && (
                <Button onClick={handleNewMeeting} size="lg" className="mt-8">
                  Create Your First Meeting
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleMeetingClick(m.id)}
                  className="group flex flex-col md:flex-row md:items-center justify-between border-2 border-border p-6 md:p-8 text-left hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-300"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold uppercase tracking-tighter leading-none group-hover:text-primary-foreground transition-colors duration-300">
                        {m.title}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground group-hover:text-primary-foreground/70 transition-colors duration-300">
                      <span>
                        {new Date(m.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span>{m.participants}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 md:mt-0 shrink-0">
                    <StatusBadge status={m.status} />
                    <span className="text-2xl group-hover:translate-x-2 transition-transform duration-300">
                      →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
