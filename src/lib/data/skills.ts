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
    category: "Finance & Data",
    items: [
      "Financial modeling",
      "Data analysis",
      "Machine learning",
      "Quantitative research",
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
    label: "3 finance & AI projects in motion",
    detail: "Finance OS, FinLearn Analytics, and Numerai tournament models.",
  },
  {
    label: "7-project portfolio",
    detail:
      "Built by directing AI-assisted engineering, even though I don't code myself.",
  },
  {
    label: "Zero outside funding",
    detail: "Every project bootstrapped. No investors, no loans.",
  },
] as const;
