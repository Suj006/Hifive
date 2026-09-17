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

/** Speaks `text` aloud in a bright, high-pitched, kid-like "cartoon" voice. */
export function speakCartoon(
  text: string,
  handlers?: { onStart?: () => void; onEnd?: () => void }
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    // Only interrupt if something's actually mid-speech — calling cancel()
    // immediately before speak() on an idle queue is a known source of
    // flakiness in some Chromium builds where the new utterance silently
    // never starts.
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.8;
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

/**
 * Call from directly inside a real click/submit handler (e.g. the login
 * button) to unlock speech synthesis for the rest of this document's
 * lifetime. Some browsers only allow a document to produce audio once it
 * has spoken from inside a genuine user gesture at least once — this
 * silent, empty utterance satisfies that without being audible, so a later
 * greeting spoken from an effect (e.g. right after navigating to the
 * dashboard) is allowed to actually play.
 */
export function primeSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const warmup = new SpeechSynthesisUtterance(" ");
    warmup.volume = 0;
    window.speechSynthesis.speak(warmup);
  } catch {
    // ignore — best-effort priming only
  }
}
