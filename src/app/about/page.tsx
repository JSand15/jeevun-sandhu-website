import type { Metadata } from "next";
import Link from "next/link";

import { FadeIn } from "@/components/motion/fade-in";
import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "About",
  description:
    "How a 15-year-old in Los Angeles ended up directing AI-assisted engineering to build and ship real products.",
  alternates: { canonical: "/about" },
};

const sections = [
  {
    title: "How I actually build",
    body: [
      "I don't write every line of code myself. I direct AI engineering tools — Claude Code, mostly — to build production software, the same way a founder might direct a small engineering team. That's not a shortcut; it's a different skill: knowing what to build, why, and how to evaluate whether the output is actually good.",
      "That distinction matters to me. I'm not pretending to be a senior engineer. I'm learning product thinking, system design, and judgment by shipping real things and seeing what breaks.",
    ],
  },
  {
    title: "Why AI, specifically",
    body: [
      "I got interested in AI because it collapsed the gap between having an idea and having a working product. A few years ago, a 15-year-old with no funding and no engineering team couldn't ship two production web apps. Now I can — and that changes what's possible for anyone willing to put in the work to direct it well.",
      "I try to treat AI as the last 10% of a product, not the first. The core has to work — the workflow, the UX, the value — before any AI feature gets bolted on.",
    ],
  },
  {
    title: "The business side",
    body: [
      "School doesn't teach you how to price something, talk to a customer, or decide what not to build. I'm learning all of that by doing it badly first — bootstrapped, no outside funding, no safety net beyond my own time.",
      "My current goal is concrete: get a real, paying customer by mid-August 2026. Not a vague 'someday.' A specific target I'm building toward right now.",
    ],
  },
  {
    title: "Curiosity and the long game",
    body: [
      "I read a lot of founder stories, partly for the tactics and partly because I want to understand how people made decisions under uncertainty — because that's the part I'm living through right now.",
      "I don't know yet which of my projects will become the real business. I'm treating that uncertainty as information, not a problem — building, testing, and letting the market tell me what's worth doubling down on.",
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="I build things, then I figure out the rest."
        description="I'm 15, based in Los Angeles, and I spend most of my non-school hours directing AI-assisted engineering to build real, working products."
      />

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
            If you&apos;re building something, invested in someone who is, or
            just want to compare notes on AI-native product development —
            I&apos;d like to hear from you.
          </p>
          <div className="mt-6">
            <Button render={<Link href="/contact" />}>Get in touch</Button>
          </div>
        </FadeIn>
      </div>
    </>
  );
}
