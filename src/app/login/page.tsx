import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/app/login/login-form";
import { FloatingParticles } from "@/app/login/floating-particles";

export const metadata: Metadata = {
  title: "Sign in — Hi Five by Jia",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      {/* animated brand-colour glow blobs */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full opacity-40 blur-3xl animate-float-slow"
        style={{ background: "var(--brand-pink)" }}
      />
      <div
        className="pointer-events-none absolute -right-32 top-1/3 h-[26rem] w-[26rem] rounded-full opacity-30 blur-3xl animate-float-slower"
        style={{ background: "var(--brand-purple)" }}
      />
      <div
        className="pointer-events-none absolute bottom-[-10rem] left-1/4 h-[24rem] w-[24rem] rounded-full opacity-30 blur-3xl animate-float-slow"
        style={{ background: "var(--brand-teal)" }}
      />

      <FloatingParticles />

      <div className="relative w-full max-w-md animate-pop-in">
        <div className="glass-card rounded-3xl border-white/10 p-8 shadow-[0_20px_80px_rgba(123,47,247,0.25)] sm:p-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div
                className="absolute inset-0 -m-1.5 rounded-full opacity-70 blur-md"
                style={{ background: "var(--gradient-brand)" }}
              />
              <Image
                src="/logo.jpeg"
                alt="Hi Five by Jia"
                width={96}
                height={96}
                priority
                className="relative h-20 w-20 rounded-full border-2 border-white/20 object-cover shadow-lg sm:h-24 sm:w-24"
              />
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight brand-text sm:text-4xl">
              Hi Five
            </h1>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
              by Jia
            </p>
            <p className="mt-3 text-sm text-muted">
              Handmade with love, made for you 💫
            </p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-xs text-muted">
            All purchase &amp; sale records, in one colourful place.
          </p>
        </div>
      </div>
    </div>
  );
}
