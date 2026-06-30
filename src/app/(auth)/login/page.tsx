"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      localStorage.setItem("userEmail", email);
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      {/* Left — Kinetic Hero */}
      <div className="lg:w-1/2 border-b-2 lg:border-b-0 lg:border-r-2 border-border flex flex-col justify-center px-8 md:px-16 py-20 lg:py-0">
        <div className="max-w-xl">
          <div className="text-[clamp(4rem,12vw,10rem)] font-bold uppercase leading-[0.85] tracking-tighter mb-4">
            MoM
          </div>
          <div className="text-[clamp(1.5rem,4vw,3rem)] font-bold uppercase tracking-tighter text-muted-foreground mb-6">
            Minutes of Meeting
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-md">
            AI-powered meeting minutes. Record, transcribe, and generate
            structured summaries in seconds.
          </p>
        </div>
      </div>

      {/* Right — Auth Form */}
      <div className="lg:w-1/2 flex items-center justify-center px-8 md:px-16 py-20 lg:py-0">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="flex border-2 border-border mb-12">
            {(["login", "signup"] as const).map((t) => (
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
                {t === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {tab === "signup" && (
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">
                  Full Name
                </label>
                <Input type="text" placeholder="Full Name" />
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" size="lg" className="w-full">
              {tab === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          {tab === "login" && (
            <p className="text-center mt-8 text-sm text-muted-foreground">
              <button
                type="button"
                className="text-primary hover:underline font-bold uppercase tracking-wider"
              >
                Forgot Password?
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
