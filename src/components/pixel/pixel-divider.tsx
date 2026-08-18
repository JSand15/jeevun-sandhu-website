import { cn } from "@/lib/utils";

import { PixelSprite, type PixelSpriteName } from "./pixel-sprite";

interface PixelDividerProps {
  className?: string;
  sprite?: PixelSpriteName;
}

export function PixelDivider({ className, sprite = "coin" }: PixelDividerProps) {
  return (
    <div
      aria-hidden
      className={cn("flex items-center gap-4 select-none", className)}
    >
      <span className="border-arcade/30 h-0 flex-1 border-t-2 border-dashed" />
      <PixelSprite name={sprite} size={16} />
      <span className="border-arcade/30 h-0 flex-1 border-t-2 border-dashed" />
    </div>
  );
}
