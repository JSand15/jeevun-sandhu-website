// Central source of truth for site copy and links.
// PLACEHOLDER markers indicate content Jeevun should personalize/verify.

export const siteConfig = {
  name: "Jeevun Sandhu",
  shortName: "Jeevun",
  title: "Jeevun Sandhu — Builder & Entrepreneur",
  role: "Student, Builder & AI-Native Entrepreneur",
  location: "Los Angeles, CA",
  url: "https://jeevun-sandhu-website.vercel.app", // PLACEHOLDER: swap for a custom domain when purchased
  email: "jeesand15@gmail.com",
  description:
    "15-year-old builder based in Los Angeles shipping real products with AI-assisted engineering — currently working toward his first paying customer.",
  tagline: "I build things, then I figure out the rest.",
  mission:
    "I want to prove that age isn't a prerequisite for building things people actually pay for. I'm not writing every line of code myself — I direct AI engineering tools to build production software, and I'm learning the fundamentals of business, design, and execution along the way.",
  currentFocus: [
    {
      label: "Shipping",
      detail: "Getting my first paying customer by mid-August 2026.",
    },
    {
      label: "Building",
      detail:
        "A multi-agent AI crew that helps me operate like a small studio instead of a solo founder.",
    },
    {
      label: "Learning",
      detail:
        "Business fundamentals, product design, and how to sell — the parts school doesn't teach.",
    },
  ],
  social: {
    github: "https://github.com/jeevunsandhu", // PLACEHOLDER: verify handle
    linkedin: "https://linkedin.com/in/jeevunsandhu", // PLACEHOLDER: verify handle
    twitter: "https://x.com/jeevunsandhu", // PLACEHOLDER: verify handle
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
