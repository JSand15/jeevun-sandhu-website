export interface SkillGroup {
  category: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    category: "Product & Direction",
    items: [
      "Product scoping",
      "AI-directed engineering",
      "UX & design judgment",
      "Rapid prototyping",
    ],
  },
  {
    category: "Frontend",
    items: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
  },
  {
    category: "AI & Tooling",
    items: [
      "Claude Code",
      "AI SDK",
      "Prompt & agent design",
      "Multi-agent systems",
    ],
  },
  {
    category: "Business",
    items: [
      "Customer discovery",
      "Pricing",
      "Go-to-market",
      "Bootstrapped growth",
    ],
  },
];

export const achievements = [
  {
    label: "2 products shipped to production",
    detail: "QuitFVR and an AI-powered real estate platform, both live.",
  },
  {
    label: "7-project portfolio",
    detail:
      "Built as a non-technical founder directing AI-assisted engineering.",
  },
  {
    label: "Zero outside funding",
    detail: "Every project bootstrapped — no investors, no loans.",
  },
] as const;
