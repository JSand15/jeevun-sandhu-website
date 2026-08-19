import { Mail } from "lucide-react";
import Link from "next/link";

import { GithubIcon, LinkedinIcon, XIcon } from "@/components/icons";
import { PixelDivider } from "@/components/pixel/pixel-divider";
import { PixelSprite } from "@/components/pixel/pixel-sprite";
import { navItems, siteConfig } from "@/lib/data/site";

const socialLinks = [
  { label: "GitHub", href: siteConfig.social.github, icon: GithubIcon },
  { label: "LinkedIn", href: siteConfig.social.linkedin, icon: LinkedinIcon },
  { label: "X (Twitter)", href: siteConfig.social.twitter, icon: XIcon },
  { label: "Email", href: siteConfig.social.email, icon: Mail },
];

export function Footer() {
  return (
    <footer className="border-border/60 border-t">
      <div className="container-wide flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="text-foreground font-medium tracking-tight">
            {siteConfig.name}
          </p>
          <p className="text-muted-foreground mt-2 text-sm text-balance">
            {siteConfig.description}
          </p>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:gap-16">
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Site
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Elsewhere
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noreferrer" : undefined}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="container-wide">
        <PixelDivider sprite="controller" />
        <p className="font-pixel text-arcade mt-6 text-center text-[8px] leading-relaxed tracking-[0.18em]">
          THANKS FOR PLAYING
        </p>
      </div>

      <div className="border-border/60 mt-8 border-t">
        <div className="container-wide text-muted-foreground flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <Link
            href="/privacy"
            className="hover:text-arcade inline-flex items-center gap-1.5 transition-colors"
          >
            <PixelSprite name="key" size={10} />
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
