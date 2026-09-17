// Tiny synthesized "cartoon voice" sound effects for Nainu, generated in-browser
// via the Web Audio API — no external audio files needed. Browsers block audio
// until a user gesture unlocks the AudioContext, so every call here is best-effort
// and silently no-ops until that happens (e.g. the first click on the guide).

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(
  audioCtx: AudioContext,
  {
    type,
    startFreq,
    endFreq,
    duration,
    gain,
  }: { type: OscillatorType; startFreq: number; endFreq: number; duration: number; gain: number }
) {
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = type;
  const now = audioCtx.currentTime;
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), now + duration);
  gainNode.gain.setValueAtTime(gain, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

export function playBlip() {
  const audioCtx = getContext();
  if (!audioCtx) return;
  try {
    const base = 480 + Math.random() * 220;
    tone(audioCtx, { type: "sine", startFreq: base, endFreq: base * 0.72, duration: 0.07, gain: 0.06 });
  } catch {
    // ignore — audio is a nice-to-have, never block the UI on it
  }
}

export function playPop() {
  const audioCtx = getContext();
  if (!audioCtx) return;
  try {
    tone(audioCtx, { type: "triangle", startFreq: 300, endFreq: 720, duration: 0.14, gain: 0.09 });
  } catch {
    // ignore
  }
}

export function playClick() {
  const audioCtx = getContext();
  if (!audioCtx) return;
  try {
    tone(audioCtx, { type: "square", startFreq: 680, endFreq: 640, duration: 0.05, gain: 0.045 });
  } catch {
    // ignore
  }
}
