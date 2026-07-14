import Link from "next/link";
import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  h2: (props) => (
    <h2
      className="text-foreground mt-12 mb-4 scroll-mt-24 text-2xl font-semibold tracking-tight"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="text-foreground mt-8 mb-3 scroll-mt-24 text-xl font-semibold tracking-tight"
      {...props}
    />
  ),
  p: (props) => (
    <p className="text-muted-foreground mt-4 leading-relaxed" {...props} />
  ),
  a: ({ href = "", ...props }) => (
    <Link
      href={href}
      className="text-foreground hover:text-brand underline underline-offset-4"
      {...props}
    />
  ),
  ul: (props) => (
    <ul
      className="text-muted-foreground mt-4 ml-6 list-disc space-y-2"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="text-muted-foreground mt-4 ml-6 list-decimal space-y-2"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="border-brand text-foreground mt-6 border-l-2 pl-5 italic"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em]"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="border-border/60 bg-card mt-6 overflow-x-auto rounded-xl border p-4 text-sm [&_code]:bg-transparent [&_code]:p-0"
      {...props}
    />
  ),
  hr: (props) => <hr className="border-border/60 my-10" {...props} />,
};
