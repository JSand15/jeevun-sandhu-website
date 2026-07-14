import type { ReactNode } from "react";

import { FadeIn } from "@/components/motion/fade-in";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <div className="container-wide pt-16 pb-12 sm:pt-24 sm:pb-16">
      <FadeIn>
        {eyebrow && (
          <p className="text-brand mb-3 text-sm font-medium tracking-wide uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="text-foreground text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-4 max-w-2xl text-lg text-balance">
            {description}
          </p>
        )}
        {children}
      </FadeIn>
    </div>
  );
}
