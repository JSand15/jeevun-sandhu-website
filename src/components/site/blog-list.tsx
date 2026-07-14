"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PostMeta } from "@/lib/blog";

const PAGE_SIZE = 6;

export function BlogList({
  posts,
  tags,
}: {
  posts: PostMeta[];
  tags: string[];
}) {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const matchesQuery =
        query.trim().length === 0 ||
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.description.toLowerCase().includes(query.toLowerCase());
      const matchesTag = !activeTag || post.tags?.includes(activeTag);
      return matchesQuery && matchesTag;
    });
  }, [posts, query, activeTag]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search posts…"
            aria-label="Search posts"
            className="pl-9"
          />
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={activeTag === null ? "default" : "outline"}
              className="cursor-pointer font-normal"
              render={
                <button
                  type="button"
                  aria-pressed={activeTag === null}
                  onClick={() => {
                    setActiveTag(null);
                    setPage(1);
                  }}
                />
              }
            >
              All
            </Badge>
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant={activeTag === tag ? "default" : "outline"}
                className="cursor-pointer font-normal"
                render={
                  <button
                    type="button"
                    aria-pressed={activeTag === tag}
                    onClick={() => {
                      setActiveTag(tag === activeTag ? null : tag);
                      setPage(1);
                    }}
                  />
                }
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {paginated.length === 0 ? (
        <p className="text-muted-foreground mt-16 text-center text-sm">
          No posts match your search yet.
        </p>
      ) : (
        <StaggerGroup className="mt-10 flex flex-col">
          {paginated.map((post, idx) => (
            <StaggerItem key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className={`group flex flex-col gap-2 py-6 sm:flex-row sm:items-baseline sm:justify-between ${
                  idx !== 0 ? "border-border/60 border-t" : ""
                }`}
              >
                <div>
                  <p className="text-foreground group-hover:text-brand font-medium transition-colors">
                    {post.title}
                  </p>
                  <p className="text-muted-foreground mt-1 max-w-xl text-sm">
                    {post.description}
                  </p>
                </div>
                <p className="text-muted-foreground shrink-0 text-sm">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
