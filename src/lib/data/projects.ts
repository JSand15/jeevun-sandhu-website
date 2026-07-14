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

// PLACEHOLDER: descriptions below are reasonable drafts based on the project
// names alone — verify/replace the specifics (problem, challenges, lessons,
// tech stack, status, links) with what's actually true for each project.
export const projects: Project[] = [
  {
    slug: "finance-os",
    name: "Finance OS",
    tagline:
      "A personal finance operating system for tracking spending, budgets, and net worth.",
    description:
      "Finance OS pulls spending, budgets, and net worth into one dashboard instead of a spreadsheet or five disconnected apps. The goal is a single place that tells you where your money actually goes.",
    problem:
      "Budgeting tools are either too simple to be useful (just categorized transactions) or too complex to keep up with (a spreadsheet that falls out of date after a week). I wanted one dashboard I'd actually open every day.",
    challenges: [
      "Designing a data model flexible enough for accounts, budgets, and categories without becoming its own maintenance burden.",
      "Building a dashboard that surfaces what matters at a glance instead of dumping every number on screen.",
      "Directing AI-assisted engineering to build the sync and calculation logic while I owned the product decisions.",
    ],
    lessons: [
      "A finance tool lives or dies on trust — accuracy matters more than any feature.",
      "The dashboard got better every time I cut something out, not added something in.",
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
    status: "in-progress",
    featured: true,
    // PLACEHOLDER: add github/demo links and a real screenshot once available.
  },
  {
    slug: "finlearn-analytics",
    name: "FinLearn Analytics",
    tagline:
      "Turning raw financial data into plain-English lessons for people learning to invest.",
    description:
      "FinLearn Analytics takes market and portfolio data and explains it in plain English instead of assuming the reader already knows what a Sharpe ratio is. It's built for people who want to actually understand investing, not just get a stock tip.",
    problem:
      "Most financial literacy content is either too dumbed-down to be useful or assumes background knowledge a beginner doesn't have yet. I wanted to bridge raw data with actual understanding.",
    challenges: [
      "Translating analytics output into explanations that don't oversimplify or condescend.",
      "Building a data pipeline that stays accurate as underlying data sources change.",
      "Deciding what to leave out — a beginner-focused tool fails if it tries to show everything.",
    ],
    lessons: [
      "Explaining a concept clearly is a forcing function for actually understanding it yourself.",
      "One well-explained chart beats a dashboard of ten unexplained ones for a learning audience.",
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Python"],
    status: "in-progress",
    featured: true,
    // PLACEHOLDER: add github/demo links and a real screenshot once available.
  },
  {
    slug: "numerai",
    name: "Numerai",
    tagline:
      "Building and submitting machine learning models to the Numerai data science tournament.",
    description:
      "Numerai is a crowdsourced hedge fund that runs an ongoing tournament: data scientists submit models against obfuscated financial data, and the best-performing ones get capital behind them. I build and iterate models for it.",
    problem:
      "Most data science practice happens on clean, well-understood tutorial datasets. Numerai's data is deliberately obfuscated and adversarial, which is a much closer approximation of what modeling real markets actually feels like.",
    challenges: [
      "Working with anonymized features with no domain intuition to lean on — every decision has to be data-driven.",
      "Avoiding overfitting to any single time period given the tournament's era-based scoring.",
      "Directing AI tooling to help iterate on model pipelines while I owned the modeling strategy.",
    ],
    lessons: [
      "Real market data is far noisier than anything in a textbook or tutorial.",
      "Consistency across time periods matters more than a single high-scoring submission.",
    ],
    techStack: ["Python", "Machine Learning", "Numerai API"],
    status: "in-progress",
    featured: true,
    // PLACEHOLDER: confirm this framing (tournament participation, not the Numerai platform itself) is accurate, and add links if you want them public.
  },
];

export function getFeaturedProjects() {
  return projects.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}
