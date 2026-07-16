import { ArrowUpRight, Mail } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { FadeIn } from "@/components/motion/fade-in";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { AvatarGlow } from "@/components/site/avatar-glow";
import { ProjectCard } from "@/components/site/project-card";
import { Timeline } from "@/components/site/timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timeline } from "@/lib/data/experience";
import { getFeaturedProjects } from "@/lib/data/projects";
import { achievements, skillGroups } from "@/lib/data/skills";
import { siteConfig } from "@/lib/data/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const featuredProjects = getFeaturedProjects();

  return (
    <>
      {/* Hero */}
      <section
        id="hero"
        className="container-wide relative overflow-hidden pt-20 pb-20 sm:pt-32 sm:pb-28"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 -z-10 h-[420px] w-[420px] opacity-[0.06] select-none sm:h-[560px] sm:w-[560px]"
          style={{
            maskImage: "radial-gradient(circle, black, transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle, black, transparent 70%)",
          }}
        >
          <Image
            src="/projects/grid-texture.png"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <FadeIn>
          <AvatarGlow />
        </FadeIn>
        <FadeIn delay={0.03}>
          <Badge variant="secondary" className="mt-8 mb-6 font-normal">
            {siteConfig.location} · {siteConfig.role}
          </Badge>
        </FadeIn>
        <FadeIn delay={0.05}>
          <h1 className="text-foreground max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {siteConfig.name}
          </h1>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-muted-foreground mt-6 max-w-xl text-lg text-balance sm:text-xl">
            {siteConfig.description}
          </p>
        </FadeIn>
        <FadeIn delay={0.15}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button size="lg" render={<Link href="/projects" />}>
              View my work
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/contact" />}
            >
              Get in touch
            </Button>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="mt-12 flex items-center gap-5">
            <a
              href={siteConfig.social.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <GithubIcon className="size-5" />
            </a>
            <a
              href={siteConfig.social.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <LinkedinIcon className="size-5" />
            </a>
            <a
              href={siteConfig.social.email}
              aria-label="Email"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="size-5" />
            </a>
          </div>
        </FadeIn>
      </section>

      {/* Mission + Current Focus */}
      <section id="focus" className="border-border/60 border-t">
        <div className="container-wide grid gap-12 py-20 sm:py-28 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <FadeIn>
            <p className="text-brand text-sm font-medium tracking-wide uppercase">
              Mission
            </p>
            <p className="text-foreground mt-4 text-2xl font-medium tracking-tight text-balance sm:text-3xl">
              {siteConfig.mission}
            </p>
          </FadeIn>

          <div>
            <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              Current focus
            </p>
            <StaggerGroup className="mt-4 flex flex-col gap-6">
              {siteConfig.currentFocus.map((item) => (
                <StaggerItem
                  key={item.label}
                  className="border-border/60 border-l-2 pl-5"
                >
                  <p className="text-foreground font-medium">{item.label}</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {item.detail}
                  </p>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="border-border/60 border-t">
        <div className="container-wide py-20 sm:py-28">
          <FadeIn className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-brand text-sm font-medium tracking-wide uppercase">
                Featured work
              </p>
              <h2 className="text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                What I&apos;m building
              </h2>
            </div>
            <Link
              href="/projects"
              className="text-foreground inline-flex items-center gap-1 text-sm font-medium hover:gap-1.5"
            >
              All projects
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </FadeIn>

          <StaggerGroup className="mt-10 grid gap-6 sm:grid-cols-2">
            {featuredProjects.map((project) => (
              <StaggerItem key={project.slug}>
                <ProjectCard project={project} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Skills */}
      <section id="skills" className="border-border/60 border-t">
        <div className="container-wide py-20 sm:py-28">
          <FadeIn>
            <p className="text-brand text-sm font-medium tracking-wide uppercase">
              Toolkit
            </p>
            <h2 className="text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              What I work with
            </h2>
          </FadeIn>

          <StaggerGroup className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {skillGroups.map((group) => (
              <StaggerItem key={group.category}>
                <h3 className="text-foreground text-sm font-medium">
                  {group.category}
                </h3>
                <ul className="mt-3 flex flex-col gap-2">
                  {group.items.map((item) => (
                    <li key={item} className="text-muted-foreground text-sm">
                      {item}
                    </li>
                  ))}
                </ul>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Timeline */}
      <section id="timeline" className="border-border/60 border-t">
        <div className="container-wide py-20 sm:py-28">
          <FadeIn className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-brand text-sm font-medium tracking-wide uppercase">
                Journey
              </p>
              <h2 className="text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                How I got here
              </h2>
            </div>
            <Link
              href="/experience"
              className="text-foreground inline-flex items-center gap-1 text-sm font-medium hover:gap-1.5"
            >
              Full timeline
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </FadeIn>

          <div className="mt-10">
            <Timeline entries={timeline.slice(0, 4)} />
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section id="achievements" className="border-border/60 border-t">
        <div className="container-wide py-20 sm:py-28">
          <FadeIn>
            <p className="text-brand text-sm font-medium tracking-wide uppercase">
              Selected achievements
            </p>
          </FadeIn>
          <StaggerGroup className="mt-8 grid gap-8 sm:grid-cols-3">
            {achievements.map((a) => (
              <StaggerItem key={a.label}>
                <p className="text-foreground text-xl font-semibold text-balance">
                  {a.label}
                </p>
                <p className="text-muted-foreground mt-2 text-sm">{a.detail}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="border-border/60 relative overflow-hidden border-t">
        <div className="absolute inset-0" aria-hidden="true">
          <Image
            src="/projects/cta-bg.jpg"
            alt=""
            fill
            className="object-cover opacity-25"
            sizes="100vw"
          />
          <div className="bg-background/88 absolute inset-0" />
        </div>
        <div className="container-wide relative py-20 text-center sm:py-28">
          <FadeIn>
            <h2 className="text-foreground mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Building something worth building? Let&apos;s talk.
            </h2>
            <p className="text-muted-foreground mx-auto mt-4 max-w-lg text-balance">
              I&apos;m open to collaborations, internships, or just chatting
              with founders, engineers, and investors.
            </p>
            <div className="mt-8 flex justify-center">
              <Button size="lg" render={<Link href="/contact" />}>
                Get in touch
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
