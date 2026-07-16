import type { Metadata } from "next";

import { PageHeader } from "@/components/site/page-header";
import { siteConfig } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What data this site collects, and what it doesn't.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy" />

      <div className="container-prose text-muted-foreground pb-24 leading-relaxed">
        <p>
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
          . {/* PLACEHOLDER: update this date whenever this policy changes. */}
        </p>

        <h2 className="text-foreground mt-10 text-lg font-semibold">
          What this site collects
        </h2>
        <p className="mt-3">
          This site uses Vercel Analytics and Vercel Speed Insights so I can
          see traffic and performance. Both are privacy-friendly by design.
          They don&apos;t use cookies and don&apos;t track you across other
          sites.
        </p>

        <h2 className="text-foreground mt-10 text-lg font-semibold">
          The contact form
        </h2>
        <p className="mt-3">
          The contact form sends whatever you type straight to my inbox
          through FormSubmit, a third-party email delivery service. I only
          use it to receive your message. It&apos;s not used for tracking,
          and nothing you send is shared or sold.
        </p>

        <h2 className="text-foreground mt-10 text-lg font-semibold">
          Third parties
        </h2>
        <p className="mt-3">
          I don&apos;t sell or share your data with anyone. FormSubmit
          handles delivering contact form messages to my inbox, and links to
          my GitHub, LinkedIn, and X are covered by those platforms&apos; own
          privacy policies once you click through.
        </p>

        <h2 className="text-foreground mt-10 text-lg font-semibold">
          Questions
        </h2>
        <p className="mt-3">
          Got questions about this? Email me at{" "}
          <a
            href={siteConfig.social.email}
            className="text-foreground underline underline-offset-4"
          >
            {siteConfig.email}
          </a>
          .
        </p>
      </div>
    </>
  );
}
