"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { ACHIEVEMENTS, getAchievement } from "@/lib/arcade/achievements";
import { levelForXp } from "@/lib/arcade/levels";
import { playSfx } from "@/lib/arcade/sfx";
import { clearState, DEFAULT_STATE, loadState, saveState } from "@/lib/arcade/storage";
import type { Achievement, AchievementId, ArcadeState, SfxName } from "@/lib/arcade/types";

interface ArcadeContextValue {
  hydrated: boolean;
  xp: number;
  level: number;
  levelTitle: string;
  levelProgress: number;
  xpToNext: number;
  unlocked: AchievementId[];
  achievements: (Achievement & { unlocked: boolean })[];
  awardXp: (amount: number, reason?: string) => void;
  unlock: (id: AchievementId) => void;
  hasUnlocked: (id: AchievementId) => boolean;
  markVisited: (path: string) => void;
  visited: string[];
  markGamePlayed: (gameId: string) => void;
  gamesPlayed: string[];
  highScore: number;
  setHighScore: (n: number) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  play: (name: SfxName) => void;
  konami: boolean;
  recentUnlocks: Achievement[];
  dismissUnlock: (id: AchievementId) => void;
  reset: () => void;
}

const ArcadeContext = createContext<ArcadeContextValue | null>(null);

/** Number of mini-games on the site; unlocks TYCOON when all are played. */
const TOTAL_GAMES = 4;

const KONAMI_SEQUENCE = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
];

const NON_COLLECTOR_IDS = ACHIEVEMENTS.filter((a) => a.id !== "collector").map((a) => a.id);

const FIRST_CONTACT_DELAY = 1200;

export function ArcadeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ArcadeState>(() => ({ ...DEFAULT_STATE }));
  const [hydrated, setHydrated] = useState(false);
  const [recentUnlocks, setRecentUnlocks] = useState<Achievement[]>([]);
  const [konami, setKonami] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;

  // ---------- hydration ----------
  useEffect(() => {
    const loaded = loadState();
    stateRef.current = loaded;
    setState(loaded);
    if (loaded.konami) setKonami(true);
    setHydrated(true);
  }, []);

  // ---------- persistence ----------
  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  // ---------- sound ----------
  const play = useCallback((name: SfxName) => {
    if (!stateRef.current.soundEnabled) return;
    playSfx(name);
  }, []);

  // ---------- xp / level ----------
  const awardXpImpl = useCallback(
    (amount: number) => {
      if (!Number.isFinite(amount) || amount === 0) return;
      const prev = stateRef.current;
      const prevLevel = levelForXp(prev.xp).level;
      const nextXp = Math.max(0, Math.round(prev.xp + amount));
      const next: ArcadeState = { ...prev, xp: nextXp };
      stateRef.current = next;
      setState(next);

      if (levelForXp(nextXp).level > prevLevel) {
        play("levelup");
      }
    },
    [play],
  );

  // `reason` is part of the public API for call-site readability; the store
  // only needs the amount.
  const awardXp = useCallback(
    (amount: number) => awardXpImpl(amount),
    [awardXpImpl],
  );

  // ---------- unlock (latest-ref pattern: safe regardless of effect ordering) ----------
  const unlockImplRef = useRef<(id: AchievementId) => void>(() => {});
  unlockImplRef.current = (id: AchievementId) => {
    const prev = stateRef.current;
    if (prev.unlocked.includes(id)) return;
    const achievement = getAchievement(id);
    if (!achievement) return;

    const nextUnlocked = [...prev.unlocked, id];
    const next: ArcadeState = { ...prev, unlocked: nextUnlocked };
    stateRef.current = next;
    setState(next);

    awardXpImpl(achievement.xp);
    play("achievement");
    setRecentUnlocks((queue) => [...queue, achievement]);

    if (id !== "collector") {
      const hasAll = NON_COLLECTOR_IDS.every((aid) => nextUnlocked.includes(aid));
      if (hasAll) {
        unlockImplRef.current("collector");
      }
    }
  };

  const unlock = useCallback((id: AchievementId) => unlockImplRef.current(id), []);

  const hasUnlocked = useCallback(
    (id: AchievementId) => stateRef.current.unlocked.includes(id),
    [],
  );

  // ---------- visited pages ----------
  const markVisited = useCallback((path: string) => {
    if (!path) return;
    const prev = stateRef.current;
    if (prev.visited.includes(path)) return;

    const nextVisited = [...prev.visited, path];
    const next: ArcadeState = { ...prev, visited: nextVisited };
    stateRef.current = next;
    setState(next);

    if (nextVisited.length === 4) {
      unlockImplRef.current("explorer");
    } else if (nextVisited.length === 7) {
      unlockImplRef.current("completionist");
    }
  }, []);

  // ---------- games played ----------
  const markGamePlayed = useCallback((gameId: string) => {
    if (!gameId) return;
    const prev = stateRef.current;
    if (prev.gamesPlayed.includes(gameId)) return;

    const nextGames = [...prev.gamesPlayed, gameId];
    const next: ArcadeState = { ...prev, gamesPlayed: nextGames };
    stateRef.current = next;
    setState(next);

    if (nextGames.length >= TOTAL_GAMES) {
      unlockImplRef.current("tycoon");
    }
  }, []);

  // ---------- high score ----------
  const setHighScore = useCallback((n: number) => {
    if (!Number.isFinite(n)) return;
    const prev = stateRef.current;
    if (n <= prev.highScore) return;
    const next: ArcadeState = { ...prev, highScore: n };
    stateRef.current = next;
    setState(next);
    unlockImplRef.current("high-scorer");
  }, []);

  // ---------- sound toggle ----------
  const toggleSound = useCallback(() => {
    const prev = stateRef.current;
    const nextEnabled = !prev.soundEnabled;
    const next: ArcadeState = { ...prev, soundEnabled: nextEnabled };
    stateRef.current = next;
    setState(next);

    if (nextEnabled) {
      playSfx("select");
      unlockImplRef.current("gamer");
    }
  }, []);

  // ---------- dismiss toast ----------
  const dismissUnlock = useCallback((id: AchievementId) => {
    setRecentUnlocks((queue) => queue.filter((a) => a.id !== id));
  }, []);

  // ---------- reset ----------
  const reset = useCallback(() => {
    const fresh = { ...DEFAULT_STATE };
    stateRef.current = fresh;
    setState(fresh);
    setRecentUnlocks([]);
    setKonami(false);
    clearState();
  }, []);

  // ---------- first contact ----------
  useEffect(() => {
    if (!hydrated) return;
    if (stateRef.current.unlocked.includes("first-contact")) return;
    const timer = window.setTimeout(() => {
      unlockImplRef.current("first-contact");
    }, FIRST_CONTACT_DELAY);
    return () => window.clearTimeout(timer);
  }, [hydrated]);

  // ---------- night owl ----------
  useEffect(() => {
    if (!hydrated) return;
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 5) {
      unlockImplRef.current("night-owl");
    }
  }, [hydrated]);

  // ---------- konami code ----------
  const bufferRef = useRef<string[]>([]);

  useEffect(() => {
    if (!hydrated) return;

    function handleKeydown(event: KeyboardEvent) {
      // Don't read the contact form's keystrokes into the cheat-code buffer.
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement ||
        (active instanceof HTMLElement && active.isContentEditable)
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const buffer = [...bufferRef.current, key].slice(-KONAMI_SEQUENCE.length);
      bufferRef.current = buffer;

      if (
        buffer.length === KONAMI_SEQUENCE.length &&
        buffer.every((k, i) => k === KONAMI_SEQUENCE[i])
      ) {
        setKonami(true);
        const prev = stateRef.current;
        const next: ArcadeState = { ...prev, konami: true };
        stateRef.current = next;
        setState(next);
        unlockImplRef.current("konami");
        bufferRef.current = [];
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [hydrated]);

  // ---------- derived values ----------
  const levelInfo = useMemo(() => levelForXp(state.xp), [state.xp]);

  const achievements = useMemo(
    () =>
      ACHIEVEMENTS.map((achievement) => ({
        ...achievement,
        unlocked: state.unlocked.includes(achievement.id),
      })),
    [state.unlocked],
  );

  const value = useMemo<ArcadeContextValue>(
    () => ({
      hydrated,
      xp: state.xp,
      level: levelInfo.level,
      levelTitle: levelInfo.title,
      levelProgress: levelInfo.progress,
      xpToNext: levelInfo.xpToNext,
      unlocked: state.unlocked,
      achievements,
      awardXp,
      unlock,
      hasUnlocked,
      markVisited,
      visited: state.visited,
      markGamePlayed,
      gamesPlayed: state.gamesPlayed,
      highScore: state.highScore,
      setHighScore,
      soundEnabled: state.soundEnabled,
      toggleSound,
      play,
      konami,
      recentUnlocks,
      dismissUnlock,
      reset,
    }),
    [
      hydrated,
      state.xp,
      state.unlocked,
      state.visited,
      state.gamesPlayed,
      state.highScore,
      state.soundEnabled,
      levelInfo,
      achievements,
      awardXp,
      unlock,
      hasUnlocked,
      markVisited,
      markGamePlayed,
      setHighScore,
      toggleSound,
      play,
      konami,
      recentUnlocks,
      dismissUnlock,
      reset,
    ],
  );

  return <ArcadeContext.Provider value={value}>{children}</ArcadeContext.Provider>;
}

export function useArcade(): ArcadeContextValue {
  const ctx = useContext(ArcadeContext);
  if (!ctx) {
    throw new Error("useArcade must be used within an ArcadeProvider");
  }
  return ctx;
}
