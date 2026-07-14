import type { Metadata } from "next";

import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { PageHeader } from "@/components/site/page-header";
import { ProjectCard } from "@/components/site/project-card";
import { projects } from "@/lib/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Real products shipped by directing AI-assisted engineering as a non-technical founder — from a vaping-cessation PWA to an AI-powered real estate platform.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Things I've shipped"
        description="Every project here is a real, working product — not a demo. I scope them, direct the engineering, and ship them end to end."
      />

      <div className="container-wide pb-24">
        <StaggerGroup className="grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <StaggerItem key={project.slug}>
              <ProjectCard project={project} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </>
  );
}
