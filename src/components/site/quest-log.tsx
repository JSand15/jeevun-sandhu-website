import { PixelBadge } from "@/components/pixel/pixel-badge";
import { PixelPanel } from "@/components/pixel/pixel-panel";
import { PixelSprite, type PixelSpriteName } from "@/components/pixel/pixel-sprite";
import { RevealChild, RevealGroup } from "@/components/scroll";
import { quests, type Quest } from "@/lib/data/arcade";

const STATUS: Record<
  Quest["status"],
  { label: string; color: "gold" | "green" | "muted"; sprite: PixelSpriteName; variant: "gold" | "default" }
> = {
  active: { label: "In progress", color: "gold", sprite: "sword", variant: "gold" },
  complete: { label: "Complete", color: "green", sprite: "trophy", variant: "default" },
  locked: { label: "Locked", color: "muted", sprite: "key", variant: "default" },
};

/** Current focus, presented as a quest log. */
export function QuestLog() {
  return (
    <RevealGroup className="grid gap-4 lg:grid-cols-2">
      {quests.map((quest) => {
        const meta = STATUS[quest.status];
        const locked = quest.status === "locked";

        return (
          <RevealChild key={quest.id}>
            <PixelPanel
              variant={meta.variant}
              className={locked ? "h-full p-5 opacity-60" : "h-full p-5"}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <PixelSprite name={meta.sprite} size={20} className="mt-0.5" />
                  <div>
                    <h3 className="text-foreground font-medium">{quest.title}</h3>
                    <p className="text-muted-foreground mt-1.5 text-sm">
                      {quest.detail}
                    </p>
                  </div>
                </div>
                <PixelBadge color={meta.color} className="shrink-0">
                  {meta.label}
                </PixelBadge>
              </div>

              <p className="font-pixel text-muted-foreground mt-4 text-[8px] leading-relaxed tracking-[0.1em] uppercase">
                Reward: <span className="text-arcade">{quest.reward}</span>
              </p>
            </PixelPanel>
          </RevealChild>
        );
      })}
    </RevealGroup>
  );
}
