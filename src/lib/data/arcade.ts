// Arcade layer content: the site's skills, focus, and story re-cut as an 8-bit
// player profile. Values are self-assessed, deliberately honest about what's
// still leveling up.

export interface PlayerStat {
  label: string;
  /** 0-10, rendered as a segmented 8-bit bar. */
  value: number;
  detail: string;
}

export const playerStats: PlayerStat[] = [
  {
    label: "Shipping",
    value: 8,
    detail: "7 projects built, 2 deployed and live.",
  },
  {
    label: "AI Direction",
    value: 9,
    detail: "I don't write the code. I direct the tools that do.",
  },
  {
    label: "Product Sense",
    value: 7,
    detail: "Scoping, cutting features, knowing what to leave out.",
  },
  {
    label: "Finance & Data",
    value: 7,
    detail: "Modeling, analysis, and ML for the Numerai tournament.",
  },
  {
    label: "Design",
    value: 6,
    detail: "Good taste, still building the vocabulary.",
  },
  {
    label: "Sales",
    value: 4,
    detail: "The stat I'm grinding right now. No paying customer yet.",
  },
];

export interface Quest {
  id: string;
  title: string;
  detail: string;
  reward: string;
  status: "active" | "locked" | "complete";
}

export const quests: Quest[] = [
  {
    id: "first-customer",
    title: "First paying customer",
    detail: "Turn one of the seven projects into something someone pays for.",
    reward: "Proof the whole thesis works",
    status: "active",
  },
  {
    id: "agent-crew",
    title: "Build the agent crew",
    detail:
      "A set of AI agents that lets me run this like a small studio instead of one kid doing everything.",
    reward: "Leverage",
    status: "active",
  },
  {
    id: "ship-two",
    title: "Ship two products live",
    detail: "Get real deployments in front of real people, not localhost demos.",
    reward: "A portfolio that's actually real",
    status: "complete",
  },
  {
    id: "raise",
    title: "Raise a round",
    detail: "Locked until there's revenue worth pointing at.",
    reward: "???",
    status: "locked",
  },
];

/** Konami-code easter egg copy. */
export const konamiMessage = {
  title: "CHEAT CODE ACCEPTED",
  body: "You typed the Konami code on a 15-year-old's portfolio site. That's the exact kind of curiosity I hire for. Email me and lead with this.",
} as const;
