"use client";

import { ChevronDown, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";

import { useArcade } from "@/components/arcade/arcade-provider";
import { getArcadeIcon } from "@/components/arcade/icon-map";
import { PixelProgress } from "@/components/pixel/pixel-progress";
import { PixelSprite } from "@/components/pixel/pixel-sprite";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * The persistent game HUD. Collapsed it is a single coin button; expanded it
 * shows level, a segmented XP bar, trophy count, sound, and the trophy case.
 */
export function ArcadeHud() {
  const {
    hydrated,
    xp,
    level,
    levelTitle,
    levelProgress,
    xpToNext,
    achievements,
    unlocked,
    soundEnabled,
    toggleSound,
    play,
    reset,
  } = useArcade();

  const [expanded, setExpanded] = useState(false);
  const [trophiesOpen, setTrophiesOpen] = useState(false);

  // Roomy screens get the full panel; phones start out of the way.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setExpanded(window.matchMedia("(min-width: 640px)").matches);
  }, []);

  if (!hydrated) return null;

  const total = achievements.length;
  const earned = unlocked.length;

  return (
    <div className="fixed bottom-4 left-4 z-40 print:hidden">
      {!expanded && (
        <button
          type="button"
          onClick={() => {
            setExpanded(true);
            play("select");
          }}
          aria-label={`Open player HUD. Level ${level}, ${earned} of ${total} trophies.`}
          className="border-arcade bg-card text-arcade font-pixel flex items-center gap-2 rounded-none border-2 px-3 py-2.5 text-[10px] leading-none shadow-[4px_4px_0_0_var(--arcade)] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          <PixelSprite name="coin" size={16} />
          LVL {level}
        </button>
      )}

      {expanded && (
        <div className="border-arcade bg-card w-[248px] rounded-none border-2 shadow-[4px_4px_0_0_var(--arcade)]">
          <div className="border-arcade/40 flex items-center justify-between border-b-2 px-3 py-2">
            <span className="font-pixel text-arcade text-[9px] leading-none tracking-[0.14em]">
              LVL {level}
            </span>
            <span className="font-pixel text-muted-foreground text-[7px] leading-none tracking-[0.12em] uppercase">
              {levelTitle}
            </span>
            <button
              type="button"
              onClick={() => {
                setExpanded(false);
                play("blip");
              }}
              aria-label="Collapse player HUD"
              className="text-muted-foreground hover:text-arcade -mr-1 p-1"
            >
              <ChevronDown className="size-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 px-3 py-3">
            <PixelProgress
              value={levelProgress * 100}
              max={100}
              blocks={14}
              color="gold"
              label={`Experience toward level ${level + 1}`}
            />
            <div className="font-pixel text-muted-foreground flex items-center justify-between text-[7px] leading-none tracking-[0.1em]">
              <span>{xp} XP</span>
              <span>{xpToNext > 0 ? `${xpToNext} TO NEXT` : "MAX"}</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Dialog open={trophiesOpen} onOpenChange={setTrophiesOpen}>
                <DialogTrigger
                  render={
                    <button
                      type="button"
                      onClick={() => play("select")}
                      className="border-arcade text-arcade font-pixel flex flex-1 items-center justify-center gap-1.5 rounded-none border-2 px-2 py-2 text-[8px] leading-none tracking-[0.12em] transition-transform active:translate-x-[2px] active:translate-y-[2px]"
                    >
                      <PixelSprite name="trophy" size={12} />
                      {earned}/{total}
                    </button>
                  }
                />
                <DialogContent
                  data-no-smooth-scroll
                  className="max-h-[85svh] overflow-y-auto sm:max-w-lg"
                >
                  <DialogHeader>
                    <DialogTitle className="font-pixel text-arcade text-xs leading-relaxed tracking-[0.12em]">
                      TROPHY CASE
                    </DialogTitle>
                    <DialogDescription>
                      {earned} of {total} unlocked. Some only show up if you go
                      looking for them.
                    </DialogDescription>
                  </DialogHeader>

                  <ul className="mt-2 grid gap-2">
                    {achievements.map((a) => {
                      const Icon = getArcadeIcon(a.icon);
                      const hidden = a.secret && !a.unlocked;
                      return (
                        <li
                          key={a.id}
                          className={cn(
                            "flex items-start gap-3 rounded-none border-2 px-3 py-2.5",
                            a.unlocked
                              ? "border-arcade bg-arcade/5"
                              : "border-border opacity-60",
                          )}
                        >
                          <Icon
                            className={cn(
                              "mt-0.5 size-4 shrink-0",
                              a.unlocked ? "text-arcade" : "text-muted-foreground",
                            )}
                            aria-hidden
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                "font-pixel text-[9px] leading-relaxed tracking-[0.1em]",
                                a.unlocked ? "text-arcade" : "text-muted-foreground",
                              )}
                            >
                              {hidden ? "???" : a.name}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                              {hidden ? "Locked. Keep poking around." : a.description}
                            </p>
                          </div>
                          <span className="font-pixel text-muted-foreground shrink-0 text-[7px] leading-none">
                            {a.xp} XP
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <button
                    type="button"
                    onClick={reset}
                    className="text-muted-foreground hover:text-arcade-red mt-4 inline-flex items-center gap-1.5 self-start text-xs"
                  >
                    <RotateCcw className="size-3" aria-hidden />
                    Reset my progress
                  </button>
                </DialogContent>
              </Dialog>

              <button
                type="button"
                onClick={toggleSound}
                aria-pressed={soundEnabled}
                aria-label={soundEnabled ? "Mute sound effects" : "Enable sound effects"}
                className={cn(
                  "flex items-center justify-center rounded-none border-2 p-2 transition-transform active:translate-x-[2px] active:translate-y-[2px]",
                  soundEnabled
                    ? "border-arcade-green text-arcade-green"
                    : "border-border text-muted-foreground",
                )}
              >
                {soundEnabled ? (
                  <Volume2 className="size-3.5" />
                ) : (
                  <VolumeX className="size-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
