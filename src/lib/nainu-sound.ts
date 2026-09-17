// Nainu's voice and UI sound effects — no external audio files needed.
// Speech uses the browser's built-in Web Speech API (speechSynthesis), pitched
// up for a cute, kid-like voice but kept at a normal speaking pace. The
// pop/click cues are tiny synthesized tones via the Web Audio API. Browsers
// restrict both until a user gesture unlocks them, so every call here is
// best-effort and silently no-ops until that happens (e.g. the first click
// on the guide).

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

let cachedVoices: SpeechSynthesisVoice[] = [];

function ensureVoicesLoaded() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  cachedVoices = window.speechSynthesis.getVoices();
  if (!cachedVoices.length) {
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      () => {
        cachedVoices = window.speechSynthesis.getVoices();
      },
      { once: true }
    );
  }
}

function pickCartoonVoice(): SpeechSynthesisVoice | undefined {
  if (!cachedVoices.length) ensureVoicesLoaded();
  return (
    cachedVoices.find((v) => /female|zira|samantha|victoria|karen|jenny|aria/i.test(v.name)) ??
    cachedVoices.find((v) => v.lang.toLowerCase().startsWith("en")) ??
    cachedVoices[0]
  );
}

/** Speaks `text` aloud in a bright, high-pitched "cartoon" voice. */
export function speakCartoon(
  text: string,
  handlers?: { onStart?: () => void; onEnd?: () => void }
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.5;
    utterance.rate = 1.0;
    utterance.volume = 0.9;
    const voice = pickCartoonVoice();
    if (voice) utterance.voice = voice;
    if (handlers?.onStart) utterance.onstart = handlers.onStart;
    if (handlers?.onEnd) utterance.onend = handlers.onEnd;
    window.speechSynthesis.speak(utterance);
  } catch {
    // ignore — speech synthesis is a nice-to-have, never block the UI on it
  }
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    // ignore
  }
}
