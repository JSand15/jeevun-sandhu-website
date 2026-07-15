import type { Metadata } from "next";

import { PageHeader } from "@/components/site/page-header";
import { Timeline } from "@/components/site/timeline";
import { timeline } from "@/lib/data/experience";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "The timeline of how I went from student to someone who actually ships products.",
  alternates: { canonical: "/experience" },
};

export default function ExperiencePage() {
  return (
    <>
      <PageHeader
        eyebrow="Experience"
        title="How I got here"
        description="School, first builds, shipped products, and what's next. In order."
      />
      <div className="container-wide pb-24">
        <Timeline entries={timeline} />
      </div>
    </>
  );
}
