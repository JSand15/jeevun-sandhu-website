import { Rss } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { BlogList } from "@/components/site/blog-list";
import { AmbientBackdrop } from "@/components/site/ambient-backdrop";
import { PageHeader } from "@/components/site/page-header";
import { luxuryImages } from "@/lib/data/luxury-images";
import { getAllPosts, getAllTags } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "My notes on building, shipping, and learning as a young AI-native founder.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
    <>
      <PageHeader
        image={luxuryImages.texture}
        scrim={62}
        eyebrow="Blog"
        sprite="floppy"
        accent="cyan"
        title="Writing"
        description="Notes on building, shipping, and learning as a young AI-native founder."
      >
        <div className="mt-4">
          <Link
            href="/blog/rss.xml"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
          >
            <Rss className="size-3.5" aria-hidden="true" />
            RSS feed
          </Link>
        </div>
      </PageHeader>

      <section className="relative isolate">
        <AmbientBackdrop />
        <div className="container-wide pb-24">
          {posts.length === 0 ? (
            <p className="text-muted-foreground">
              Nothing published yet. First post is coming soon.
            </p>
          ) : (
            <BlogList posts={posts} tags={tags} />
          )}
        </div>
      </section>
    </>
  );
}
