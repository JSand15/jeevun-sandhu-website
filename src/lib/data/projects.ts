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
// names alone, verify/replace the specifics (problem, challenges, lessons,
// tech stack, status, links) with what's actually true for each project.
export const projects: Project[] = [
  {
    slug: "finance-os",
    name: "Finance OS",
    tagline:
      "My personal finance dashboard for tracking spending, budgets, and net worth in one place.",
    description:
      "Finance OS pulls my spending, budgets, and net worth into one dashboard instead of a spreadsheet or five different apps. I wanted one place that actually tells me where my money's going.",
    problem:
      "Budgeting apps are either too simple to be useful (just categorized transactions) or too complicated to keep up with (a spreadsheet that's outdated after a week). I wanted a dashboard I'd actually open every day.",
    challenges: [
      "Figuring out a data model flexible enough for accounts, budgets, and categories without it turning into a mess to maintain.",
      "Building a dashboard that shows me what matters at a glance instead of dumping every number on the screen.",
      "Directing AI-assisted engineering to build the sync and calculation logic while I handled the product decisions.",
    ],
    lessons: [
      "A finance tool lives or dies on trust. Accuracy matters more than any feature.",
      "The dashboard got better every time I cut something out, not added something in.",
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
    status: "in-progress",
    featured: true,
    image: "/projects/finance-os.jpg",
    // PLACEHOLDER: add github/demo links once available.
  },
  {
    slug: "finlearn-analytics",
    name: "FinLearn Analytics",
    tagline:
      "Turning raw financial data into plain-English lessons for people learning to invest.",
    description:
      "FinLearn Analytics takes market and portfolio data and explains it in plain English instead of assuming you already know what a Sharpe ratio is. I built it for people who actually want to understand investing, not just get a stock tip.",
    problem:
      "Most financial literacy content is either too dumbed-down to be useful or assumes you already know stuff a beginner doesn't. I wanted to bridge raw data with actual understanding.",
    challenges: [
      "Turning analytics output into explanations that don't oversimplify or talk down to people.",
      "Building a data pipeline that stays accurate as the underlying data sources change.",
      "Figuring out what to leave out. A beginner-focused tool fails if it tries to show everything.",
    ],
    lessons: [
      "Explaining something clearly forces you to actually understand it yourself.",
      "One well-explained chart beats a dashboard of ten unexplained ones if you're trying to teach someone.",
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Python"],
    status: "in-progress",
    featured: true,
    image: "/projects/finlearn-analytics.jpg",
    // PLACEHOLDER: add github/demo links once available.
  },
  {
    slug: "numerai",
    name: "Numerai",
    tagline:
      "Building and submitting machine learning models to the Numerai data science tournament.",
    description:
      "Numerai is a crowdsourced hedge fund that runs an ongoing tournament. Data scientists submit models against obfuscated financial data, and the best ones get real capital behind them. I build and tweak models for it.",
    problem:
      "Most data science practice happens on clean, easy-to-understand tutorial datasets. Numerai's data is deliberately obfuscated and adversarial, which feels a lot closer to what modeling real markets is actually like.",
    challenges: [
      "Working with anonymized features with zero domain intuition to lean on. Every decision has to be data-driven.",
      "Avoiding overfitting to any single time period since the tournament scores across different eras.",
      "Directing AI tools to help iterate on model pipelines while I owned the modeling strategy.",
    ],
    lessons: [
      "Real market data is way noisier than anything in a textbook or tutorial.",
      "Staying consistent across time periods matters more than one lucky high-scoring submission.",
    ],
    techStack: ["Python", "Machine Learning", "Numerai API"],
    status: "in-progress",
    featured: true,
    image: "/projects/numerai.jpg",
    // PLACEHOLDER: confirm this framing (tournament participation, not the Numerai platform itself) is accurate, and add links if you want them public.
  },
];

export function getFeaturedProjects() {
  return projects.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}
