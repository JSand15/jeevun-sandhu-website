import type { Metadata } from "next";

import { GithubIcon, LinkedinIcon, XIcon } from "@/components/icons";
import { FadeIn } from "@/components/motion/fade-in";
import { ContactForm } from "@/components/site/contact-form";
import { PageHeader } from "@/components/site/page-header";
import { siteConfig } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Jeevun Sandhu — email, GitHub, LinkedIn, and X.",
  alternates: { canonical: "/contact" },
};

const contactLinks = [
  {
    label: "Email",
    value: siteConfig.email,
    href: siteConfig.social.email,
    icon: null,
  },
  {
    label: "GitHub",
    value: "@jeevunsandhu",
    href: siteConfig.social.github,
    icon: GithubIcon,
  },
  {
    label: "LinkedIn",
    value: "Jeevun Sandhu",
    href: siteConfig.social.linkedin,
    icon: LinkedinIcon,
  },
  {
    label: "X (Twitter)",
    value: "@jeevunsandhu",
    href: siteConfig.social.twitter,
    icon: XIcon,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's talk"
        description="Open to collaborations, internships, and conversations with founders, engineers, and investors."
      />

      <div className="container-wide grid gap-16 pb-24 lg:grid-cols-2">
        <FadeIn>
          <ContactForm />
        </FadeIn>

        <FadeIn delay={0.05}>
          <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
            Elsewhere
          </p>
          <ul className="mt-4 flex flex-col gap-4">
            {contactLinks.map(({ label, value, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  className="border-border/60 hover:border-brand/40 hover:bg-muted/40 flex items-center gap-3 rounded-xl border p-4 transition-colors"
                >
                  {Icon && (
                    <Icon className="text-muted-foreground size-4 shrink-0" />
                  )}
                  <span>
                    <span className="text-foreground block text-sm font-medium">
                      {label}
                    </span>
                    <span className="text-muted-foreground block text-sm">
                      {value}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </>
  );
}
