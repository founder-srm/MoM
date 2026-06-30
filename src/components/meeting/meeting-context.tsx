"use client";

import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";
import type { MeetingForm } from "@/lib/types/meeting";

type MeetingContextType = {
  meetingForm: MeetingForm | null;
  setMeetingForm: (form: MeetingForm | null) => void;
  meetingData: MeetingForm | null;
  setMeetingData: (data: MeetingForm | null) => void;
  meetingId: string | null;
  getOrCreateMeetingId: () => string;
};

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export function MeetingProvider({ children }: { children: React.ReactNode }) {
  const [meetingForm, setMeetingForm] = useState<MeetingForm | null>(null);
  const [meetingData, setMeetingData] = useState<MeetingForm | null>(null);
  const [meetingId, setMeetingId] = useState<string | null>(null);

  const getOrCreateMeetingId = useCallback(() => {
    if (!meetingId) {
      const newId = crypto.randomUUID();
      setMeetingId(newId);
      return newId;
    }
    return meetingId;
  }, [meetingId]);

  return (
    <MeetingContext.Provider
      value={{
        meetingForm,
        setMeetingForm,
        meetingData,
        setMeetingData,
        meetingId,
        getOrCreateMeetingId,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
}

export function useMeetingFlow() {
  const context = useContext(MeetingContext);
  if (context === undefined) {
    throw new Error("useMeetingFlow must be used within a MeetingProvider");
  }
  return context;
}
