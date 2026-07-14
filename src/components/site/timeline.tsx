import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { Badge } from "@/components/ui/badge";
import type { TimelineEntry } from "@/lib/data/experience";

const typeLabel: Record<TimelineEntry["type"], string> = {
  education: "Education",
  project: "Project",
  milestone: "Milestone",
};

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <StaggerGroup className="flex flex-col">
      {entries.map((entry, idx) => (
        <StaggerItem key={entry.id}>
          <div
            className={`grid gap-2 py-6 sm:grid-cols-[140px_1fr] sm:gap-8 ${
              idx !== 0 ? "border-border/60 border-t" : ""
            }`}
          >
            <p className="text-muted-foreground text-sm">{entry.date}</p>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-foreground font-medium">{entry.title}</p>
                <Badge variant="outline" className="font-normal">
                  {typeLabel[entry.type]}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">{entry.org}</p>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-relaxed">
                {entry.description}
              </p>
            </div>
          </div>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
