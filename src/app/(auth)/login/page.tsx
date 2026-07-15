"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMessage(null);
    setIsSubmitting(true);

    const supabase = createClient();

    const { error } =
      tab === "login"
        ? await supabase.auth.signInWithPassword({
            email,
            password,
          })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: fullName,
              },
            },
          });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (tab === "login") {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setErrorMessage(
      "Account created. Check your email to confirm your signup.",
    );
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
                <label
                  htmlFor="fullName"
                  className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3"
                >
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs uppercase tracking-widest font-bold text-muted-foreground mb-3"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
