export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  problem: string;
  challenges: string[];
  lessons: string[];
  techStack: string[];
  status: "live" | "in-progress" | "prototype";
  featured: boolean;
  github?: string;
  demo?: string;
  /** Path to a real screenshot. Omit to render the generated thumbnail. */
  image?: string;
}

export const projects: Project[] = [
  {
    slug: "quitfvr",
    name: "QuitFVR",
    tagline: "A PWA that helps people quit vaping and nicotine addiction.",
    description:
      "QuitFVR is a progressive web app built to help people track cravings, log progress, and stay accountable while quitting vaping. It's designed to be installable, fast, and usable without a native app store.",
    problem:
      "Most quit-smoking apps are cluttered, subscription-gated, or built for cigarettes rather than vaping specifically. I wanted something lightweight that people would actually open every day.",
    challenges: [
      "Designing a PWA that feels native — install prompts, offline support, and fast load times without an app store.",
      "Making a habit-tracking UI that's motivating without being guilt-driven.",
      "Directing AI-assisted engineering to ship a real, working product end-to-end as a non-technical founder.",
    ],
    lessons: [
      "Shipping beats planning — a working v1 taught me more than weeks of designing the 'perfect' version.",
      "Behavior-change products live or die on daily engagement, not feature count.",
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "PWA"],
    status: "live",
    featured: true,
    // PLACEHOLDER: add a real screenshot via the `image` field.
  },
  {
    slug: "ai-real-estate",
    name: "AI Real Estate Platform",
    tagline:
      "An AI-assisted platform for landlords to manage properties and tenants.",
    description:
      "A platform built for landlords to handle tenant communication, property management tasks, and day-to-day operations, with AI features layered on top of the core workflow rather than bolted on as a gimmick.",
    problem:
      "Small landlords are stuck between spreadsheets and enterprise property management software that's overkill for a handful of units. I wanted something in between — simple, but smart.",
    challenges: [
      "Modeling a domain (property management) I had zero personal experience in, which meant heavier upfront research before writing a single feature.",
      "Sequencing the build so core workflows (tenants, properties, tasks) were solid before adding any AI feature.",
      "Balancing scope as a solo, non-technical founder directing engineering work.",
    ],
    lessons: [
      "AI features should be the last 10%, not the first — the core product has to work without them.",
      "Talking to the actual user (a landlord) before building saved me from over-engineering the wrong thing.",
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "AI SDK"],
    status: "live",
    featured: true,
    // PLACEHOLDER: add a real screenshot via the `image` field.
  },
];

export function getFeaturedProjects() {
  return projects.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}
