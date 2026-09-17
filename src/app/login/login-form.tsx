"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/use-api";
import { primeSpeech } from "@/lib/nainu-sound";
import { resetNainuSession } from "@/lib/nainu-session";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Unlocks speech synthesis for this document right within this real
    // click, so Nainu's greeting on the dashboard a moment later is allowed
    // to actually be audible.
    primeSpeech();
    setLoading(true);
    setError(null);
    try {
      await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      // Nainu should greet once for this fresh login, even if the last
      // session (in this same tab) already had its auto-greet.
      resetNainuSession();
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");
      router.push(next && next.startsWith("/") ? next : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          Username
        </label>
        <input
          required
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Jia"
          className="w-full h-12 rounded-xl bg-white/[0.06] border border-white/15 px-4 text-base text-foreground placeholder:text-muted/60 outline-none transition-colors focus:border-brand-pink-2 focus:ring-2 focus:ring-brand-pink-2/25"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
          Password
        </label>
        <div className="relative">
          <input
            required
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-12 rounded-xl bg-white/[0.06] border border-white/15 px-4 pr-12 text-base text-foreground placeholder:text-muted/60 outline-none transition-colors focus:border-brand-pink-2 focus:ring-2 focus:ring-brand-pink-2/25"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted hover:text-foreground cursor-pointer"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={loading} className="h-12 w-full text-base">
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
