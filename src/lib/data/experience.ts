export interface TimelineEntry {
  id: string;
  date: string;
  title: string;
  org: string;
  description: string;
  type: "education" | "project" | "milestone";
}

// PLACEHOLDER: dates are approximate, verify and refine before publishing.
export const timeline: TimelineEntry[] = [
  {
    id: "middle-school",
    date: "2022",
    title: "Started middle school",
    org: "Middle School", // PLACEHOLDER: name the actual school
    description: "Where it all started. Before any of the building began.",
    type: "education",
  },
  {
    id: "locked-in",
    date: "2024-2025",
    title: "Locked in",
    org: "Los Angeles",
    description:
      "After the LA fires hit close to home, something shifted. I stopped treating building as a side hobby and started treating it like a real commitment.",
    type: "milestone",
  },
  {
    id: "high-school",
    date: "2025-Present",
    title: "Started high school",
    org: "Palisades Charter High School",
    description:
      "Balancing a full course load with building products outside of class hours. School eats most of my weekday time, so I have to be efficient with what's left.",
    type: "education",
  },
  {
    id: "finance-ai-projects",
    date: "2025-2026",
    title: "Started building finance & AI projects",
    org: "Independent",
    description:
      "Started directing AI-assisted engineering to build Finance OS, FinLearn Analytics, and machine learning models for the Numerai tournament.",
    type: "project",
  },
  {
    id: "ais-os",
    date: "2026",
    title: "Building a multi-agent AI crew",
    org: "AIS-OS",
    description:
      "Putting together a crew of specialized AI agents so I can run more like a small studio than one kid doing everything myself. Covers research, copy, dev, and ops.",
    type: "project",
  },
  {
    id: "first-customer",
    date: "Target: August 2026",
    title: "First paying customer",
    org: "Independent",
    description:
      "Right now I'm focused on turning one of these products into a real, paying business. Bootstrapped, no outside funding.",
    type: "milestone",
  },
];
