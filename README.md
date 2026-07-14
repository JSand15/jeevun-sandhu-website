# Jeevun Sandhu — Personal Site

Personal site built with Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, and
Framer Motion.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
pnpm dev      # start the dev server (Turbopack)
pnpm build    # production build
pnpm start    # run the production build locally
pnpm lint     # eslint
```

## Content that needs personalizing

Search the codebase for `PLACEHOLDER` comments — they mark content generated as a reasonable
default that should be verified or replaced:

- `src/lib/data/site.ts` — social links, production domain
- `src/lib/data/projects.ts` — project screenshots (`image` field)
- `src/lib/data/experience.ts` — timeline dates
- `src/lib/data/reading.ts` — reading list

## Blog

Posts live in `content/blog/*.mdx` with frontmatter (`title`, `description`, `date`, `tags`,
`published`). Add a file there and it shows up on `/blog` automatically.

## Deployment

Deployed on Vercel. Pushing to the connected branch triggers a new deployment; `vercel --prod`
deploys the current working tree directly.
