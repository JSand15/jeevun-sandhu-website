import { PixelPanel } from "@/components/pixel/pixel-panel";
import { PixelProgress } from "@/components/pixel/pixel-progress";
import { PixelSprite } from "@/components/pixel/pixel-sprite";
import { RevealChild, RevealGroup } from "@/components/scroll";
import { playerStats } from "@/lib/data/arcade";

/** The skills section, re-cut as an 8-bit character sheet. */
export function PlayerStats() {
  return (
    <RevealGroup className="grid gap-4 sm:grid-cols-2">
      {playerStats.map((stat) => (
        <RevealChild key={stat.label}>
          <PixelPanel className="h-full p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-pixel text-arcade text-[10px] leading-none tracking-[0.12em]">
                {stat.label}
              </p>
              <span className="font-pixel text-muted-foreground text-[9px] leading-none">
                {stat.value}/10
              </span>
            </div>

            <PixelProgress
              value={stat.value}
              max={10}
              blocks={10}
              color={stat.value >= 8 ? "gold" : stat.value >= 6 ? "cyan" : "magenta"}
              label={`${stat.label}: ${stat.value} out of 10`}
              className="mt-4"
            />

            <p className="text-muted-foreground mt-4 text-sm">{stat.detail}</p>
          </PixelPanel>
        </RevealChild>
      ))}
    </RevealGroup>
  );
}

/** Small header ornament used above the stat sheet. */
export function PlayerStatsBadge() {
  return (
    <span className="text-arcade inline-flex items-center gap-2">
      <PixelSprite name="controller" size={20} />
    </span>
  );
}
