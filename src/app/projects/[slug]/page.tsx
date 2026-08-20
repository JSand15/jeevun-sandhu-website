import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GithubIcon } from "@/components/icons";
import { FadeIn } from "@/components/motion/fade-in";
import { AmbientBackdrop } from "@/components/site/ambient-backdrop";
import { ProjectThumbnail } from "@/components/site/project-thumbnail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProjectBySlug, projects } from "@/lib/data/projects";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: project.name,
    description: project.tagline,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: project.name,
      description: project.tagline,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <div className="relative isolate">
      <AmbientBackdrop dither />
      <div className="container-wide py-16 sm:py-24">
        <FadeIn>
          <Link
            href="/projects"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            All projects
          </Link>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-foreground font-display text-5xl tracking-tight text-balance sm:text-6xl">
                {project.name}
              </h1>
              <p className="text-muted-foreground mt-3 max-w-xl text-lg text-balance">
                {project.tagline}
              </p>
            </div>
            <div className="flex gap-2">
              {project.github && (
                <Button
                  variant="outline"
                  render={
                    <a href={project.github} target="_blank" rel="noreferrer" />
                  }
                >
                  <GithubIcon className="size-4" />
                  Code
                </Button>
              )}
              {project.demo && (
                <Button
                  render={
                    <a href={project.demo} target="_blank" rel="noreferrer" />
                  }
                >
                  Live demo
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="border-border/60 bg-muted mt-10 aspect-16/9 overflow-hidden rounded-2xl border">
            <ProjectThumbnail name={project.name} slug={project.slug} />
          </div>
        </FadeIn>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_280px]">
          <FadeIn className="flex flex-col gap-10">
            <section>
              <h2 className="text-foreground text-lg font-semibold">
                Overview
              </h2>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                {project.description}
              </p>
            </section>

            <section>
              <h2 className="text-foreground text-lg font-semibold">
                The problem
              </h2>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                {project.problem}
              </p>
            </section>

            <section>
              <h2 className="text-foreground text-lg font-semibold">
                Challenges solved
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {project.challenges.map((c) => (
                  <li
                    key={c}
                    className="text-muted-foreground flex gap-2 leading-relaxed"
                  >
                    <span className="text-brand mt-2 block size-1 shrink-0 rounded-full bg-current" />
                    {c}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-foreground text-lg font-semibold">
                Lessons learned
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {project.lessons.map((l) => (
                  <li
                    key={l}
                    className="text-muted-foreground flex gap-2 leading-relaxed"
                  >
                    <span className="text-brand mt-2 block size-1 shrink-0 rounded-full bg-current" />
                    {l}
                  </li>
                ))}
              </ul>
            </section>
          </FadeIn>

          <FadeIn delay={0.05}>
            <div className="border-border/60 rounded-2xl border p-6">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Status
              </p>
              <p className="text-foreground mt-2 text-sm capitalize">
                {project.status.replace("-", " ")}
              </p>

              <p className="text-muted-foreground mt-6 text-xs font-medium tracking-wide uppercase">
                Tech stack
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <Badge key={tech} variant="outline" className="font-normal">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
