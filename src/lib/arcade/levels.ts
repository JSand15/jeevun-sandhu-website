export interface LevelDef {
  level: number;
  title: string;
  floor: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  floor: number;
  ceiling: number;
  /** 0..1 progress through the current level */
  progress: number;
  /** XP remaining to reach the next level, 0 if max level */
  xpToNext: number;
}

export const LEVELS: LevelDef[] = [
  { level: 1, title: "Script Kiddie", floor: 0 },
  { level: 2, title: "Intern", floor: 100 },
  { level: 3, title: "Builder", floor: 250 },
  { level: 4, title: "Shipper", floor: 450 },
  { level: 5, title: "Operator", floor: 700 },
  { level: 6, title: "Closer", floor: 1000 },
  { level: 7, title: "Founder", floor: 1400 },
  { level: 8, title: "Legend", floor: 1900 },
];

export function levelForXp(xp: number): LevelInfo {
  const safeXp = Number.isFinite(xp) && xp > 0 ? xp : 0;

  let current = LEVELS[0];
  for (const def of LEVELS) {
    if (safeXp >= def.floor) {
      current = def;
    } else {
      break;
    }
  }

  const isMax = current.level === LEVELS[LEVELS.length - 1].level;
  const next = LEVELS.find((def) => def.level === current.level + 1);

  if (isMax || !next) {
    return {
      level: current.level,
      title: current.title,
      floor: current.floor,
      ceiling: current.floor,
      progress: 1,
      xpToNext: 0,
    };
  }

  const span = next.floor - current.floor;
  const progress = span > 0 ? Math.min(1, Math.max(0, (safeXp - current.floor) / span)) : 1;

  return {
    level: current.level,
    title: current.title,
    floor: current.floor,
    ceiling: next.floor,
    progress,
    xpToNext: Math.max(0, next.floor - safeXp),
  };
}
