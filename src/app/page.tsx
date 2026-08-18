import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PixelDivider } from "@/components/pixel/pixel-divider";
import { PixelHeading } from "@/components/pixel/pixel-heading";
import { PixelSprite } from "@/components/pixel/pixel-sprite";
import { Reveal, RevealChild, RevealGroup } from "@/components/scroll";
import { ArcadeHero } from "@/components/site/arcade-hero";
import { ArcadeSection } from "@/components/site/arcade-section";
import { LuxuryBand } from "@/components/site/luxury-band";
import { PlayerStats } from "@/components/site/player-stats";
import { ProjectCard } from "@/components/site/project-card";
import { QuestLog } from "@/components/site/quest-log";
import { Timeline } from "@/components/site/timeline";
import { timeline } from "@/lib/data/experience";
import { luxuryImages } from "@/lib/data/luxury-images";
import { getFeaturedProjects } from "@/lib/data/projects";
import { achievements } from "@/lib/data/skills";
import { siteConfig } from "@/lib/data/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const featuredProjects = getFeaturedProjects();

  return (
    <>
      <ArcadeHero />

      {/* Mission — the quiet, expensive half of the site. */}
      <LuxuryBand image={luxuryImages.watch} speed={0.22} scrim={72}>
        <p className="text-arcade font-pixel text-[9px] tracking-[0.2em] uppercase">
          Mission
        </p>
        <p className="text-foreground font-display mt-6 max-w-3xl text-3xl leading-tight text-balance sm:text-4xl lg:text-5xl">
          {siteConfig.mission}
        </p>
      </LuxuryBand>

      {/* Player stats — the loud, 8-bit half. */}
      <section id="skills" className="border-border/60 border-t">
        <div className="container-wide py-20 sm:py-28">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <PixelHeading as="p" className="text-[9px]">
                Player stats
              </PixelHeading>
              <h2 className="text-foreground font-display mt-3 text-4xl tracking-tight sm:text-5xl">
                What I&apos;m good at, honestly
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg text-balance">
                Self-assessed and deliberately not all tens. The low one is the
                one I&apos;m grinding right now.
              </p>
            </div>
            <PixelSprite name="controller" size={32} />
          </Reveal>

          <div className="mt-12">
            <PlayerStats />
          </div>
        </div>
      </section>

      {/* Featured work — level select. */}
      <section id="projects" className="border-border/60 border-t">
        <div className="container-wide py-20 sm:py-28">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <PixelHeading as="p" className="text-[9px]" accent="cyan" cursor>
                Level select
              </PixelHeading>
              <h2 className="text-foreground font-display mt-3 text-4xl tracking-tight sm:text-5xl">
                What I&apos;m building
              </h2>
            </div>
            <Link
              href="/projects"
              className="text-foreground hover:text-arcade inline-flex items-center gap-1 text-sm font-medium transition-colors"
            >
              All projects
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2">
            {featuredProjects.map((project) => (
              <RevealChild key={project.slug}>
                <ProjectCard project={project} />
              </RevealChild>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* Cinematic break. */}
      <LuxuryBand
        image={luxuryImages.manhattan}
        speed={0.3}
        scrim={64}
        height="min-h-[60svh]"
      >
        <p className="text-foreground font-display max-w-3xl text-3xl leading-tight text-balance sm:text-4xl lg:text-5xl">
          I&apos;m not waiting until I&apos;m older to start. The work is the
          proof.
        </p>
      </LuxuryBand>

      {/* Quest log. */}
      <section id="focus" className="border-border/60 border-t">
        <div className="container-wide py-20 sm:py-28">
          <Reveal>
            <PixelHeading as="p" className="text-[9px]" accent="magenta">
              Quest log
            </PixelHeading>
            <h2 className="text-foreground font-display mt-3 text-4xl tracking-tight sm:text-5xl">
              What I&apos;m working on
            </h2>
          </Reveal>

          <div className="mt-12">
            <QuestLog />
          </div>
        </div>
      </section>

      {/* Timeline. */}
      <section id="timeline" className="border-border/60 border-t">
        <div className="container-wide py-20 sm:py-28">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <PixelHeading as="p" className="text-[9px]">
                Journey
              </PixelHeading>
              <h2 className="text-foreground font-display mt-3 text-4xl tracking-tight sm:text-5xl">
                How I got here
              </h2>
            </div>
            <Link
              href="/experience"
              className="text-foreground hover:text-arcade inline-flex items-center gap-1 text-sm font-medium transition-colors"
            >
              Full timeline
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Reveal>

          <div className="mt-10">
            <Timeline entries={timeline.slice(0, 4)} />
          </div>
        </div>
      </section>

      {/* Achievements. */}
      <section id="achievements" className="border-border/60 border-t">
        <div className="container-wide py-20 sm:py-28">
          <Reveal>
            <PixelHeading as="p" className="text-[9px]">
              Selected achievements
            </PixelHeading>
          </Reveal>
          <RevealGroup className="mt-10 grid gap-8 sm:grid-cols-3">
            {achievements.map((a) => (
              <RevealChild key={a.label}>
                <PixelSprite name="trophy" size={24} />
                <p className="text-foreground mt-4 text-xl font-semibold text-balance">
                  {a.label}
                </p>
                <p className="text-muted-foreground mt-2 text-sm">{a.detail}</p>
              </RevealChild>
            ))}
          </RevealGroup>

          <PixelDivider className="mt-16" sprite="star" />
        </div>
      </section>

      <ArcadeSection />

      {/* CTA. */}
      <LuxuryBand
        image={luxuryImages.flight}
        speed={0.28}
        scrim={70}
        height="min-h-[65svh]"
      >
        <div className="text-center">
          <h2 className="text-foreground font-display mx-auto max-w-3xl text-4xl leading-tight text-balance sm:text-5xl">
            Building something worth building? Let&apos;s talk.
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-lg text-balance">
            I&apos;m open to collaborations, internships, or just chatting with
            founders, engineers, and investors.
          </p>
          <div className="mt-10 flex justify-center">
            <Link
              href="/contact"
              className="border-arcade bg-arcade text-arcade-foreground font-pixel inline-flex items-center gap-2 rounded-none border-2 px-6 py-4 text-[10px] tracking-[0.14em] uppercase shadow-[4px_4px_0_0_var(--foreground)] transition-transform active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
              <PixelSprite name="rocket" size={14} />
              Get in touch
            </Link>
          </div>
        </div>
      </LuxuryBand>
    </>
  );
}
