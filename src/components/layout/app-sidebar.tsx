"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { createClient } from "@/lib/supabase/client";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState("user@example.com");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    {
      key: "/dashboard",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      label: "Dashboard",
    },
    {
      key: "/meetings/new",
      icon: "M12 4v16m8-8H4",
      label: "New Meeting",
    },
  ];

  return (
    <aside className="w-60 bg-slate-950 flex flex-col py-6 shrink-0 h-full text-slate-400 font-sora">
      <div className="px-5 pb-7 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20">
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <span className="text-white font-semibold text-[15px] tracking-wide">
            MoM AI
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.key);
          return (
            <button
              key={item.key}
              onClick={() => router.push(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left text-sm ${isActive ? "bg-blue-600/20 text-blue-200 font-semibold shadow-sm" : "hover:bg-white/5 hover:text-slate-300"}`}
            >
              <svg
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={item.icon}
                />
              </svg>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 pt-4 pb-2 border-t border-white/10 flex flex-col gap-2">
        <div className="flex items-center justify-between px-2 mb-2">
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3 mb-2 px-2">
          <Avatar className="h-8 w-8 bg-blue-200 text-blue-900 font-bold font-mono">
            {email.slice(0, 2).toUpperCase()}
          </Avatar>
          <div className="overflow-hidden">
            <p className="text-[13px] text-slate-200 font-medium leading-tight truncate">
              {email.split("@")[0]}
            </p>
            <p className="text-[11px] text-slate-500 truncate">{email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full py-2 border border-white/10 rounded-lg bg-transparent text-slate-400 text-xs hover:bg-white/5 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
