import type { Metadata } from "next";

import { PageHeader } from "@/components/site/page-header";
import { Timeline } from "@/components/site/timeline";
import { timeline } from "@/lib/data/experience";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "The timeline of how a 15-year-old student became a shipping product builder.",
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  return (
    <>
      <PageHeader
        eyebrow="Experience"
        title="How I got here"
        description="School, first builds, shipped products, and what's next — in order."
      />
      <div className="container-wide pb-24">
        <Timeline entries={timeline} />
      </div>
    </>
  );
}
