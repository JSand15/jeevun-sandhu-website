import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { GithubIcon } from "@/components/icons";
import { PixelBadge } from "@/components/pixel/pixel-badge";
import { Badge } from "@/components/ui/badge";
import { ProjectThumbnail } from "@/components/site/project-thumbnail";
import type { Project } from "@/lib/data/projects";

const statusLabel: Record<Project["status"], string> = {
  live: "Live",
  "in-progress": "In progress",
  prototype: "Prototype",
};

const statusColor: Record<Project["status"], "green" | "gold" | "cyan"> = {
  live: "green",
  "in-progress": "gold",
  prototype: "cyan",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="border-border/60 bg-card group hover:border-brand/40 relative flex flex-col overflow-hidden rounded-2xl border transition-colors">
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="bg-muted relative aspect-16/10 overflow-hidden">
          {project.image ? (
            <Image
              src={project.image}
              alt={`${project.name} screenshot`}
              fill
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <ProjectThumbnail name={project.name} slug={project.slug} />
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-foreground text-lg font-semibold">
              <Link
                href={`/projects/${project.slug}`}
                className="hover:text-brand transition-colors"
              >
                {project.name}
              </Link>
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              {project.tagline}
            </p>
          </div>
          <PixelBadge color={statusColor[project.status]} className="shrink-0">
            {statusLabel[project.status]}
          </PixelBadge>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {project.techStack.map((tech) => (
            <Badge
              key={tech}
              variant="outline"
              className="text-muted-foreground font-normal"
            >
              {tech}
            </Badge>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-4 pt-2">
          <Link
            href={`/projects/${project.slug}`}
            className="text-foreground inline-flex items-center gap-1 text-sm font-medium hover:gap-1.5"
          >
            Read case study
            <ArrowUpRight
              className="size-3.5 transition-transform"
              aria-hidden="true"
            />
          </Link>
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
              aria-label={`${project.name} on GitHub`}
            >
              <GithubIcon className="size-3.5" aria-hidden="true" />
              Code
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
