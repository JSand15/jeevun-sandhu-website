import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { FadeIn } from "@/components/motion/fade-in";
import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "About",
  description:
    "I'm 15 and based in Los Angeles. Here's how I ended up directing AI-assisted engineering to build and ship real products.",
  alternates: { canonical: "/about" },
};

const sections = [
  {
    title: "How I actually build",
    body: [
      "I don't write every line of code myself. I direct AI engineering tools, mostly Claude Code, to build real software, kind of like how a founder might direct a small engineering team. That's not a shortcut. It's a different skill. Knowing what to build, why, and being able to tell if the output is actually good.",
      "That difference matters to me. I'm not pretending to be some senior engineer. I'm learning product thinking, system design, and judgment by actually shipping stuff and seeing what breaks.",
    ],
  },
  {
    title: "Why AI, specifically",
    body: [
      "I got into AI because it closed the gap between having an idea and actually having a working product. A few years ago, a 15-year-old with no money and no team couldn't build real finance and data products alone. Now I can. That changes what's possible for anyone willing to put in the work to direct it the right way.",
      "I try to treat AI as the last 10% of a product, not the first. The core has to actually work first, the workflow, the design, the value, before I bolt any AI feature onto it.",
    ],
  },
  {
    title: "The business side",
    body: [
      "School doesn't teach you how to price something, talk to a customer, or decide what not to build. I'm learning all that by doing it badly first. Bootstrapped, no outside funding, no safety net besides my own time.",
      "My current goal is simple: get a real, paying customer by mid-August 2026. Not some vague someday. An actual target I'm working toward right now.",
    ],
  },
  {
    title: "Curiosity and the long game",
    body: [
      "I read a lot of founder stories, partly for the tactics and partly because I want to see how people made decisions when they had no idea what was going to happen. That's the part I'm living through right now.",
      "I still don't know which of my projects is going to turn into the real business. I'm not treating that as a problem, it's just information. I keep building, testing, and letting the market tell me what's actually worth doubling down on.",
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="I build things, then I figure out the rest."
        description="I'm 15, I live in Los Angeles, and I spend most of my non-school hours directing AI-assisted engineering to build real, working products."
      />

      <div className="container-wide pb-6">
        <FadeIn>
          <div className="border-border/60 bg-muted/40 relative mx-auto aspect-16/10 max-w-3xl overflow-hidden rounded-2xl border">
            <Image
              src="/projects/macbook.png"
              alt="A MacBook, one of the tools I build with"
              fill
              className="object-contain p-10 sm:p-14"
              sizes="(min-width: 1024px) 768px, 100vw"
              priority
            />
          </div>
        </FadeIn>
      </div>

      <div className="container-prose pb-24">
        {sections.map((section, idx) => (
          <FadeIn key={section.title} as="section">
            {idx !== 0 && <Separator className="my-10" />}
            <h2 className="text-foreground text-xl font-semibold tracking-tight">
              {section.title}
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              {section.body.map((p) => (
                <p key={p} className="text-muted-foreground leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </FadeIn>
        ))}

        <Separator className="my-10" />

        <FadeIn>
          <p className="text-foreground text-lg font-medium text-balance">
            If you&apos;re building something, backing someone who is, or
            just want to talk shop about building with AI, I&apos;d like to
            hear from you.
          </p>
          <div className="mt-6">
            <Button render={<Link href="/contact" />}>Get in touch</Button>
          </div>
        </FadeIn>
      </div>
    </>
  );
}
