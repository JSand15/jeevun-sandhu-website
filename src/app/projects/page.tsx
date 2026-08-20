import type { Metadata } from "next";

import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { BugSquashSection } from "@/components/site/games/bug-squash-section";
import { AmbientBackdrop } from "@/components/site/ambient-backdrop";
import { PageHeader } from "@/components/site/page-header";
import { luxuryImages } from "@/lib/data/luxury-images";
import { ProjectCard } from "@/components/site/project-card";
import { projects } from "@/lib/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Finance and AI projects I built by directing AI-assisted engineering, even though I'm not a coder myself. Everything from a personal finance dashboard to machine learning models for the Numerai tournament.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        image={luxuryImages.aerial}
        scrim={58}
        eyebrow="Projects"
        sprite="controller"
        accent="cyan"
        title="What I'm building"
        description="Finance and AI, mostly. I scope these myself, direct the engineering, and keep tweaking until they're actually good."
      />

      <section className="relative isolate">
        <AmbientBackdrop />
        <div className="container-wide pb-24">
          <StaggerGroup className="grid gap-6 sm:grid-cols-2">
            {projects.map((project) => (
              <StaggerItem key={project.slug}>
                <ProjectCard project={project} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>
      <BugSquashSection />
    </>
  );
}
