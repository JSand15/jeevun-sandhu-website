import { Rss } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { BlogList } from "@/components/site/blog-list";
import { PageHeader } from "@/components/site/page-header";
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

      <div className="container-wide pb-24">
        {posts.length === 0 ? (
          <p className="text-muted-foreground">
            Nothing published yet. First post is coming soon.
          </p>
        ) : (
          <BlogList posts={posts} tags={tags} />
        )}
      </div>
    </>
  );
}
