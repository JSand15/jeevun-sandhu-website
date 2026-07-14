import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="container-wide flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-brand text-sm font-medium tracking-wide uppercase">
        404
      </p>
      <h1 className="text-foreground mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
        This page doesn&apos;t exist
      </h1>
      <p className="text-muted-foreground mt-4 max-w-md text-balance">
        The page you&apos;re looking for was moved, deleted, or never existed in
        the first place.
      </p>
      <Button size="lg" className="mt-8" render={<Link href="/" />}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to home
      </Button>
    </div>
  );
}
