"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { NainuCharacter } from "@/components/nainu/nainu-character";
import { TypewriterText } from "@/components/nainu/typewriter-text";
import { buildNainuSteps, NAINU_FAREWELL } from "@/components/nainu/steps";
import { IconClose, IconArrowLeft } from "@/components/icons";
import { playPop, playClick, speakCartoon, stopSpeaking } from "@/lib/nainu-sound";
import { useApi } from "@/lib/use-api";
import { cn } from "@/lib/cn";

const SEEN_KEY = "hifive_nainu_seen_intro";
// Safety net in case speech synthesis is unsupported/blocked and never fires
// its "end" event — the farewell still closes on its own after this long.
const FAREWELL_FALLBACK_MS = 6000;

const TONE_CHIP: Record<string, string> = {
  pink: "bg-brand-pink/15 text-brand-pink-2",
  purple: "bg-brand-purple/15 text-brand-purple-2",
  teal: "bg-brand-teal/15 text-brand-teal",
  gold: "bg-brand-gold/15 text-brand-gold",
};

function hasSeenIntro(): boolean {
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // ignore — localStorage may be unavailable (private mode, etc.)
  }
}

// This component is loaded client-only (see the dynamic import in the
// Dashboard page) since its initial open/closed state depends on
// localStorage — there's no server-rendered version to hydrate against.
export function NainuGuide() {
  const { data: me } = useApi<{ username: string }>("/api/auth/me");
  const steps = useMemo(() => buildNainuSteps(me?.username), [me?.username]);

  const [open, setOpen] = useState(() => !hasSeenIntro());
  const [stepIndex, setStepIndex] = useState(0);
  const [talking, setTalking] = useState(false);
  const [showFarewell, setShowFarewell] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const StepIcon = step.icon;

  // Nainu speaks each step's text aloud as soon as it's shown — an
  // external-system side effect (not setState), so it belongs directly in
  // the effect body. Doesn't fire while the farewell is playing, since
  // neither `open` nor `step` changes when closeGuide() starts it.
  useEffect(() => {
    if (!open || showFarewell) return;
    speakCartoon(step.body, {
      onStart: () => setTalking(true),
      onEnd: () => setTalking(false),
    });
    return () => stopSpeaking();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- showFarewell intentionally excluded: it only ever flips true from inside closeGuide(), which already takes over speech itself
  }, [open, step]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  function openGuide() {
    playPop();
    setStepIndex(0);
    setShowFarewell(false);
    setOpen(true);
    markSeen();
  }

  function finalizeClose() {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    stopSpeaking();
    setOpen(false);
    setShowFarewell(false);
    markSeen();
  }

  function closeGuide() {
    if (showFarewell) {
      // Already saying bye — a second click skips straight to closed.
      finalizeClose();
      return;
    }
    playClick();
    setShowFarewell(true);
    speakCartoon(NAINU_FAREWELL, {
      onStart: () => setTalking(true),
      onEnd: finalizeClose,
    });
    closeTimeoutRef.current = setTimeout(finalizeClose, FAREWELL_FALLBACK_MS);
  }

  function goNext() {
    playClick();
    if (isLast) {
      closeGuide();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  }

  function goBack() {
    playClick();
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-3 lg:bottom-5 lg:right-5">
      {open ? (
        <div className="w-[min(92vw,384px)] overflow-hidden rounded-3xl border border-border glass-card shadow-2xl animate-pop-in">
          <div className="flex items-center justify-between px-4 pt-3.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Nainu&apos;s guide
            </span>
            <button
              onClick={closeGuide}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-foreground cursor-pointer"
              aria-label="Close guide"
            >
              <IconClose className="h-4 w-4" />
            </button>
          </div>

          {showFarewell ? (
            <div className="flex items-start gap-3 px-4 py-3">
              <NainuCharacter size={64} talking={talking} waving className="shrink-0" />
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-border bg-surface-2 px-3.5 py-3">
                <p className="mb-1 text-sm font-semibold text-foreground">Bye for now! 👋</p>
                <TypewriterText
                  key="farewell"
                  text={NAINU_FAREWELL}
                  className="text-sm leading-relaxed text-muted"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 px-4 pt-2">
                <NainuCharacter size={64} talking={talking} className="shrink-0" />
                <div className="relative min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-border bg-surface-2 px-3.5 py-3">
                  <div className="mb-1 flex items-center gap-1.5">
                    <div
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-md",
                        TONE_CHIP[step.tone]
                      )}
                    >
                      <StepIcon className="h-3 w-3" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  </div>
                  <TypewriterText
                    key={stepIndex}
                    text={step.body}
                    className="text-sm leading-relaxed text-muted"
                  />
                </div>
              </div>

              {step.href ? (
                <div className="px-4 pt-3">
                  <Link
                    href={step.href}
                    onClick={markSeen}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-brand-purple-2/40 bg-[image:var(--gradient-brand-soft)] px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:brightness-110"
                  >
                    {step.cta} →
                  </Link>
                </div>
              ) : null}

              <div className="flex items-center justify-between px-4 py-3.5">
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        i === stepIndex ? "w-5 bg-[image:var(--gradient-brand)]" : "w-1.5 bg-white/15"
                      )}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  {!isFirst ? (
                    <button
                      onClick={goBack}
                      className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium text-muted transition-colors hover:bg-white/5 hover:text-foreground cursor-pointer"
                    >
                      <IconArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  ) : null}
                  <button
                    onClick={goNext}
                    className="inline-flex h-8 items-center rounded-lg bg-[image:var(--gradient-brand)] px-3.5 text-xs font-semibold text-white shadow-[0_4px_16px_rgba(236,24,118,0.3)] transition-all hover:brightness-110 cursor-pointer"
                  >
                    {isLast ? "Let's go!" : "Next"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <button
          onClick={openGuide}
          aria-label="Open Nainu's guide"
          className="group relative flex h-16 w-16 items-center justify-center rounded-full border border-border glass-card shadow-2xl transition-transform hover:-translate-y-0.5 cursor-pointer"
        >
          <NainuCharacter size={52} waving />
        </button>
      )}
    </div>
  );
}
