export interface TimelineEntry {
  id: string;
  date: string;
  title: string;
  org: string;
  description: string;
  type: "education" | "project" | "milestone";
}

// PLACEHOLDER: dates are approximate — verify and refine before publishing.
export const timeline: TimelineEntry[] = [
  {
    id: "palisades-charter",
    date: "2023 — Present",
    title: "Student",
    org: "Palisades Charter High School",
    description:
      "Balancing a full course load with building products outside of class hours — school takes most weekday time, so execution has to be efficient.",
    type: "education",
  },
  {
    id: "first-build",
    date: "2025",
    title: "Started building software products",
    org: "Independent",
    description:
      "Began directing AI-assisted engineering tools to build real, working software as a non-technical founder — starting with small utilities and PWAs.",
    type: "milestone",
  },
  {
    id: "quitfvr-launch",
    date: "2025",
    title: "Shipped QuitFVR",
    org: "Independent",
    description:
      "Designed and shipped a progressive web app to help people quit vaping — first fully deployed product.",
    type: "project",
  },
  {
    id: "ai-real-estate-launch",
    date: "2025 — 2026",
    title: "Shipped AI Real Estate Platform",
    org: "Independent",
    description:
      "Built a property management platform for landlords with AI-assisted workflows layered on top of core operations.",
    type: "project",
  },
  {
    id: "ais-os",
    date: "2026",
    title: "Building a multi-agent AI crew",
    org: "AIS-OS",
    description:
      "Assembling a system of specialized AI agents to operate more like a small studio than a solo founder — covering research, copy, dev, and ops.",
    type: "project",
  },
  {
    id: "first-customer",
    date: "Target: August 2026",
    title: "First paying customer",
    org: "Independent",
    description:
      "Currently focused on turning one of these products into a real, paying business — bootstrapped, no outside funding.",
    type: "milestone",
  },
];
