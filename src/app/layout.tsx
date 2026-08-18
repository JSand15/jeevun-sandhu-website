import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Instrument_Serif, Press_Start_2P, VT323 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { MotionConfig } from "framer-motion";

import "./globals.css";

import {
  AchievementToasts,
  ArcadeHud,
  ArcadeProvider,
} from "@/components/arcade";
import { ArcadeTracker } from "@/components/arcade/arcade-tracker";
import { ScrollProgress, SmoothScrollProvider } from "@/components/scroll";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { ThemeProvider } from "@/components/site/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteConfig } from "@/lib/data/site";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Jeevun Sandhu",
    "student entrepreneur",
    "AI builder",
    "software engineer",
    "young founder",
    "AI-native development",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  openGraph: {
    type: "website",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/blog/rss.xml", title: `${siteConfig.name} Blog RSS` },
      ],
    },
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.name,
  url: siteConfig.url,
  jobTitle: siteConfig.role,
  description: siteConfig.description,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Los Angeles",
    addressRegion: "CA",
  },
  sameAs: [
    siteConfig.social.github,
    siteConfig.social.linkedin,
    siteConfig.social.twitter,
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${pressStart.variable} ${vt323.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-svh flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <MotionConfig reducedMotion="user">
            <TooltipProvider delay={200}>
              <ArcadeProvider>
                <SmoothScrollProvider>
                  <a
                    href="#main-content"
                    className="bg-background text-foreground focus:ring-brand sr-only z-100 rounded-md border px-4 py-2 text-sm focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:ring-2"
                  >
                    Skip to content
                  </a>
                  <ScrollProgress />
                  <Navbar />
                  <main id="main-content" className="flex-1 pt-16">
                    {children}
                  </main>
                  <Footer />
                  <ArcadeTracker />
                  <ArcadeHud />
                  <AchievementToasts />
                </SmoothScrollProvider>
              </ArcadeProvider>
            </TooltipProvider>
          </MotionConfig>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
