import type { Metadata } from "next";

import { StaggerGroup, StaggerItem } from "@/components/motion/stagger";
import { FadeIn } from "@/components/motion/fade-in";
import { PageHeader } from "@/components/site/page-header";
import { Badge } from "@/components/ui/badge";
import { alsoReadNote, books, readingNote, type Book } from "@/lib/data/reading";

export const metadata: Metadata = {
  title: "Reading",
  description: "What I'm reading, what I've read, and what stuck.",
  alternates: { canonical: "/reading" },
};

const statusLabel: Record<Book["status"], string> = {
  reading: "Currently reading",
  favorite: "Favorite",
};

function BookRow({ book }: { book: Book }) {
  return (
    <div className="border-border/60 border-t py-6 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-foreground font-medium">{book.title}</p>
        <Badge variant="outline" className="font-normal">
          {statusLabel[book.status]}
        </Badge>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">{book.author}</p>
      {book.takeaway && (
        <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-relaxed italic">
          &ldquo;{book.takeaway}&rdquo;
        </p>
      )}
    </div>
  );
}

export default function ReadingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Reading"
        title="What I'm reading"
        description={readingNote}
      />

      <div className="container-prose pb-24">
        <FadeIn>
          <h2 className="text-foreground text-sm font-medium tracking-wide uppercase">
            Currently reading
          </h2>
        </FadeIn>
        <StaggerGroup className="mt-2">
          {books
            .filter((b) => b.status === "reading")
            .map((book) => (
              <StaggerItem key={book.title}>
                <BookRow book={book} />
              </StaggerItem>
            ))}
        </StaggerGroup>

        <FadeIn>
          <h2 className="text-foreground mt-14 text-sm font-medium tracking-wide uppercase">
            Favorites
          </h2>
        </FadeIn>
        <StaggerGroup className="mt-2">
          {books
            .filter((b) => b.status === "favorite")
            .map((book) => (
              <StaggerItem key={book.title}>
                <BookRow book={book} />
              </StaggerItem>
            ))}
        </StaggerGroup>

        <FadeIn>
          <h2 className="text-foreground mt-14 text-sm font-medium tracking-wide uppercase">
            Also read
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl text-sm leading-relaxed">
            {alsoReadNote}
          </p>
        </FadeIn>
      </div>
    </>
  );
}
