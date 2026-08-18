"use client";

import { ArrowUpRight, Mail } from "lucide-react";
import Link from "next/link";

import { GithubIcon, LinkedinIcon } from "@/components/icons";
import { PixelAvatarFrame } from "@/components/pixel/pixel-avatar-frame";
import { PixelBadge } from "@/components/pixel/pixel-badge";
import { PixelButton } from "@/components/pixel/pixel-button";
import { PixelImage } from "@/components/pixel/pixel-image";
import { PixelSprite } from "@/components/pixel/pixel-sprite";
import { Scanlines } from "@/components/pixel/scanlines";
import { ParallaxImage, Reveal } from "@/components/scroll";
import { Button } from "@/components/ui/button";
import { luxuryImages } from "@/lib/data/luxury-images";
import { siteConfig } from "@/lib/data/site";

export function ArcadeHero() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[92svh] items-center overflow-hidden"
    >
      <ParallaxImage
        src={luxuryImages.skyline.src}
        alt={luxuryImages.skyline.alt}
        speed={0.18}
        priority
        className="absolute inset-0 -z-10"
        imageClassName="object-cover"
      />
      <div
        aria-hidden
        className="from-background/70 via-background/85 to-background absolute inset-0 -z-10 bg-gradient-to-b"
      />
      <Scanlines intensity="subtle" className="-z-10" />

      <div className="container-wide relative py-24">
        <Reveal>
          <PixelBadge color="gold" className="pixel-blink">
            <PixelSprite name="coin" size={10} />
            Insert coin
          </PixelBadge>
        </Reveal>

        <Reveal delay={0.05} className="mt-8">
          <PixelAvatarFrame name={siteConfig.shortName} subtitle="LVL 15">
            <div className="size-28 sm:size-36">
              <PixelImage
                src="/avatar.png"
                alt="Jeevun Sandhu"
                width={144}
                height={144}
                pixelSize={8}
                hoverReveal
                priority
              />
            </div>
          </PixelAvatarFrame>
        </Reveal>

        <Reveal delay={0.1} className="mt-10">
          <h1 className="text-foreground font-display max-w-4xl text-6xl leading-[0.95] tracking-tight text-balance sm:text-7xl lg:text-8xl">
            {siteConfig.name}
          </h1>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="text-muted-foreground mt-6 max-w-xl text-lg text-balance sm:text-xl">
            {siteConfig.description}
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button size="lg" render={<Link href="/projects" />}>
              View my work
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Button>
            <PixelButton
              variant="ghost"
              size="md"
              onClick={() => {
                document
                  .getElementById("arcade")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <PixelSprite name="controller" size={14} />
              Play my game
            </PixelButton>
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mt-12 flex items-center gap-5">
            <a
              href={siteConfig.social.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="text-muted-foreground hover:text-arcade transition-colors"
            >
              <GithubIcon className="size-5" />
            </a>
            <a
              href={siteConfig.social.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="text-muted-foreground hover:text-arcade transition-colors"
            >
              <LinkedinIcon className="size-5" />
            </a>
            <a
              href={siteConfig.social.email}
              aria-label="Email"
              className="text-muted-foreground hover:text-arcade transition-colors"
            >
              <Mail className="size-5" />
            </a>
          </div>
        </Reveal>
      </div>

      <div
        aria-hidden
        className="text-arcade pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <span className="pixel-bob font-pixel block text-[8px] tracking-[0.2em]">
          ▼
        </span>
      </div>
    </section>
  );
}
