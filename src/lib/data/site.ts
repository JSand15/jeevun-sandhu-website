// Central source of truth for site copy and links.
// PLACEHOLDER markers indicate content Jeevun should personalize/verify.

export const siteConfig = {
  name: "Jeevun Sandhu",
  shortName: "Jeevun",
  title: "Jeevun Sandhu | Builder & Entrepreneur",
  role: "Student, Builder & AI-Native Entrepreneur",
  location: "Los Angeles, CA",
  url: "https://jeevun-sandhu-website.vercel.app", // PLACEHOLDER: swap for a custom domain when purchased
  email: "jeesand15@gmail.com",
  description:
    "I'm 15, I live in Los Angeles, and I build real products with AI-assisted engineering. Right now I'm working toward my first paying customer.",
  tagline: "I build things, then I figure out the rest.",
  mission:
    "I want to prove you don't need to hit some age to build stuff people actually pay for. I'm not writing every line of code myself, I direct AI engineering tools to build real software, and I'm picking up business, design, and execution skills along the way.",
  currentFocus: [
    {
      label: "Shipping",
      detail: "Getting my first paying customer by mid-August 2026.",
    },
    {
      label: "Building",
      detail:
        "A crew of AI agents that helps me run things like a small studio instead of just one kid doing it all.",
    },
    {
      label: "Learning",
      detail:
        "Business basics, product design, and how to actually sell something. The stuff school doesn't teach.",
    },
  ],
  social: {
    github: "https://github.com/JSand15",
    githubHandle: "JSand15",
    linkedin: "https://www.linkedin.com/in/jeevunsandhu/",
    linkedinName: "Jeevun Sandhu",
    twitter: "https://x.com/JeevSand",
    twitterHandle: "@JeevSand",
    email: "mailto:jeesand15@gmail.com",
  },
} as const;

export const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Experience", href: "/experience" },
  { label: "Reading", href: "/reading" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
] as const;

export const homeSectionIds = [
  "hero",
  "focus",
  "projects",
  "skills",
  "timeline",
  "achievements",
  "cta",
] as const;
