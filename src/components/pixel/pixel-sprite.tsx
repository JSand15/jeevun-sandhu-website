import { cn } from "@/lib/utils";

/**
 * Hand-drawn 8-bit sprites.
 *
 * Each sprite is a grid of single-character cells rendered as integer-aligned
 * <rect> elements, so what ships is genuine pixel art rather than a smooth
 * vector icon shrunk down. "." is transparent; every other character maps to a
 * colour in the sprite's own palette. "F" always means currentColor, which lets
 * a sprite inherit the surrounding text colour.
 */

interface SpriteDef {
  palette: Record<string, string>;
  rows: string[];
}

const GOLD = { o: "#7a4f10", g: "#f5c542", h: "#fff3b0" };
const STEEL = { o: "#2b2f3a", g: "#8a93a8", h: "#e8edf7" };

const SPRITES = {
  coin: {
    palette: GOLD,
    rows: [
      "..oooo..",
      ".oggggo.",
      "oghhgggo",
      "oghhgggo",
      "oghhgggo",
      "oghhgggo",
      ".oggggo.",
      "..oooo..",
    ],
  },
  heart: {
    palette: { r: "#d23c4a", h: "#ff8fa0", o: "#5e1018" },
    rows: [
      ".rr..rr.",
      "rhhrrrrr",
      "rhrrrrrr",
      "rrrrrrrr",
      ".rrrrrr.",
      "..rrrr..",
      "...rr...",
      "........",
    ],
  },
  star: {
    palette: { s: "#f5c542", h: "#fff3b0" },
    rows: [
      "....s...",
      "...shs..",
      "sssshsss",
      ".sshhss.",
      "..ssss..",
      ".ss..ss.",
      "ss....ss",
      "........",
    ],
  },
  trophy: {
    palette: GOLD,
    rows: [
      "oooooooo",
      "ogghhggo",
      "ogghhggo",
      "oogggggo",
      "..ogggo.",
      "...ogo..",
      "..ooooo.",
      ".oooooo.",
    ],
  },
  ghost: {
    palette: { g: "#e8edf7", o: "#2b2f3a", e: "#3355ff" },
    rows: [
      "..oooo..",
      ".oggggo.",
      "ogeggego",
      "ogeggego",
      "oggggggo",
      "oggggggo",
      "oggggggo",
      "o.oo.oo.",
    ],
  },
  controller: {
    palette: { ...STEEL, r: "#d23c4a" },
    rows: [
      "........",
      ".oooooo.",
      "oghggggo",
      "ohhhgrgo",
      "oghgggro",
      "oggggggo",
      ".oo..oo.",
      "........",
    ],
  },
  floppy: {
    palette: { o: "#1b1f2a", g: "#4a5568", h: "#e8edf7" },
    rows: [
      "oooooooo",
      "ohhoohho",
      "ohhoohho",
      "ohhoohho",
      "oggggggo",
      "ohhhhhho",
      "ohooooho",
      "oooooooo",
    ],
  },
  crown: {
    palette: { ...GOLD, r: "#d23c4a" },
    rows: [
      "........",
      "o......o",
      "oo....oo",
      "ogo..ogo",
      "oggooggo",
      "ogrggrgo",
      "oggggggo",
      "oooooooo",
    ],
  },
  rocket: {
    palette: { o: "#2b2f3a", g: "#e8edf7", r: "#d23c4a", f: "#f5c542" },
    rows: [
      "...oo...",
      "..oggo..",
      "..oggo..",
      ".ogrrgo.",
      ".oggggo.",
      "orggggro",
      "o.offo.o",
      "...ff...",
    ],
  },
  key: {
    palette: GOLD,
    rows: [
      ".oooo...",
      "og..go..",
      "og..go..",
      ".oooo...",
      "..gg....",
      "..ggog..",
      "..gg....",
      "..ggog..",
    ],
  },
  skull: {
    palette: { g: "#e8edf7", o: "#2b2f3a" },
    rows: [
      "..oooo..",
      ".oggggo.",
      "oggggggo",
      "ogoggogo",
      "ogoggogo",
      "oggggggo",
      ".ogogog.",
      "..oooo..",
    ],
  },
  diamond: {
    palette: { c: "#3fd8e8", h: "#d7fbff", o: "#0d5b66" },
    rows: [
      "..oooo..",
      ".ohhcco.",
      "ohhcccco",
      "occcccco",
      ".occcco.",
      "..occo..",
      "...oo...",
      "........",
    ],
  },
  sword: {
    palette: { ...STEEL, w: "#8a5a2b" },
    rows: [
      "......oo",
      ".....ohh",
      "....ohho",
      "...ohho.",
      "..ohho..",
      "ooho....",
      "owo.....",
      "oo......",
    ],
  },
  chest: {
    palette: { ...GOLD, w: "#6b3f14", d: "#3a230b" },
    rows: [
      "..dddd..",
      ".dwwwwd.",
      "dwwwwwwd",
      "dwwwwwwd",
      "dddgggdd",
      "dwwgggwd",
      "dwwwwwwd",
      "dddddddd",
    ],
  },
} as const satisfies Record<string, SpriteDef>;

export type PixelSpriteName = keyof typeof SPRITES;

export const PIXEL_SPRITE_NAMES = Object.keys(SPRITES) as PixelSpriteName[];

interface PixelSpriteProps {
  name: PixelSpriteName;
  /** Rendered edge length in px. Sprites stay crisp at any size. */
  size?: number;
  className?: string;
  /** Purely decorative by default; pass a label to expose it to assistive tech. */
  label?: string;
}

export function PixelSprite({
  name,
  size = 16,
  className,
  label,
}: PixelSpriteProps) {
  const sprite: SpriteDef = SPRITES[name];
  const height = sprite.rows.length;
  const width = sprite.rows[0]?.length ?? height;

  const cells: React.ReactElement[] = [];
  sprite.rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x += 1) {
      const char = row[x];
      if (char === ".") continue;
      const fill =
        char === "F" ? "currentColor" : (sprite.palette[char] ?? "currentColor");
      cells.push(
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={fill} />,
      );
    }
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={cn("inline-block shrink-0 align-middle", className)}
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {cells}
    </svg>
  );
}
