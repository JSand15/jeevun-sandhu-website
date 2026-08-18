import type { SfxName } from "./types";

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let unavailable = false;

function getContext(): AudioContext | null {
  if (unavailable) return null;
  if (typeof window === "undefined") return null;

  if (ctx) return ctx;

  try {
    const AudioCtx = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!AudioCtx) {
      unavailable = true;
      return null;
    }
    ctx = new AudioCtx();
    return ctx;
  } catch {
    unavailable = true;
    return null;
  }
}

interface Note {
  /** frequency in Hz */
  freq: number;
  /** seconds from now the note starts */
  start: number;
  /** duration in seconds */
  duration: number;
  type?: OscillatorType;
  peak?: number;
}

function playNotes(audioCtx: AudioContext, notes: Note[]) {
  const now = audioCtx.currentTime;

  for (const note of notes) {
    const { freq, start, duration, type = "square", peak = 0.06 } = note;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now + start);

    const attackEnd = now + start + Math.min(0.015, duration * 0.3);
    const releaseEnd = now + start + duration;

    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(peak, attackEnd);
    gain.gain.exponentialRampToValueAtTime(0.0001, releaseEnd);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now + start);
    osc.stop(releaseEnd + 0.02);
  }
}

function sequences(name: SfxName): Note[] {
  switch (name) {
    case "coin":
      return [
        { freq: 880, start: 0, duration: 0.08, type: "square" },
        { freq: 1318.5, start: 0.08, duration: 0.16, type: "square" },
      ];
    case "levelup":
      return [
        { freq: 523.25, start: 0, duration: 0.09, type: "triangle" },
        { freq: 659.25, start: 0.09, duration: 0.09, type: "triangle" },
        { freq: 784.0, start: 0.18, duration: 0.09, type: "triangle" },
        { freq: 1046.5, start: 0.27, duration: 0.18, type: "triangle" },
      ];
    case "achievement":
      return [
        { freq: 784.0, start: 0, duration: 0.1, type: "triangle", peak: 0.07 },
        { freq: 987.77, start: 0.1, duration: 0.1, type: "triangle", peak: 0.07 },
        { freq: 1318.5, start: 0.2, duration: 0.22, type: "triangle", peak: 0.08 },
      ];
    case "start":
      return [
        { freq: 392.0, start: 0, duration: 0.07, type: "square" },
        { freq: 523.25, start: 0.07, duration: 0.07, type: "square" },
        { freq: 659.25, start: 0.14, duration: 0.14, type: "square" },
      ];
    case "error":
      return [
        { freq: 130.81, start: 0, duration: 0.18, type: "square", peak: 0.05 },
        { freq: 98.0, start: 0.12, duration: 0.18, type: "square", peak: 0.05 },
      ];
    case "select":
      return [{ freq: 660, start: 0, duration: 0.035, type: "square", peak: 0.04 }];
    case "blip":
    default:
      return [{ freq: 520, start: 0, duration: 0.03, type: "square", peak: 0.04 }];
  }
}

export function playSfx(name: SfxName): void {
  const audioCtx = getContext();
  if (!audioCtx) return;

  try {
    if (audioCtx.state === "suspended") {
      void audioCtx.resume().catch(() => {});
    }
    playNotes(audioCtx, sequences(name));
  } catch {
    // synthesis failed — fail silently, sound is not critical
  }
}
