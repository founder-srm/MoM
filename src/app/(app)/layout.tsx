"use client";

import { usePathname, useRouter } from "next/navigation";
import { MeetingProvider } from "@/components/meeting/meeting-context";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isWizard =
    pathname.includes("/meetings/") && !pathname.endsWith("/dashboard");

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b-2 border-border px-6 md:px-12 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="font-bold uppercase tracking-tighter text-xl hover:text-primary transition-colors"
        >
          MoM
        </button>
        <div className="flex items-center gap-4">
          {isWizard && (
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              New Meeting
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full">
        <MeetingProvider>{children}</MeetingProvider>
      </main>
    </div>
  );
}
