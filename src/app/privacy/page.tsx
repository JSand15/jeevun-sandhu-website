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
          This site uses Vercel Analytics and Vercel Speed Insights to
          understand traffic and performance. Both are privacy-friendly by
          design — they don&apos;t use cookies and don&apos;t track visitors
          across other sites.
        </p>

        <h2 className="text-foreground mt-10 text-lg font-semibold">
          The contact form
        </h2>
        <p className="mt-3">
          The contact form on this site doesn&apos;t submit data to a server or
          database. It opens your email client with a prefilled message, which
          you choose to send. Nothing you type is stored by this site unless you
          actually send that email.
        </p>

        <h2 className="text-foreground mt-10 text-lg font-semibold">
          Third parties
        </h2>
        <p className="mt-3">
          This site doesn&apos;t sell or share data with third parties. Links to
          external profiles (GitHub, LinkedIn, X) are governed by those
          platforms&apos; own privacy policies once you click through.
        </p>

        <h2 className="text-foreground mt-10 text-lg font-semibold">
          Questions
        </h2>
        <p className="mt-3">
          Reach out at{" "}
          <a
            href={siteConfig.social.email}
            className="text-foreground underline underline-offset-4"
          >
            {siteConfig.email}
          </a>{" "}
          with any questions about this policy.
        </p>
      </div>
    </>
  );
}
