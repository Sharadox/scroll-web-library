import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * Next.js `Link` for a section of a page. For one on this page (`#contact`), Next.js updates the address and
 * `SmoothScroll` does the scrolling (`scroll={false}`), so the page glides there instead of two scrolls fighting. For
 * one on another page (`/en#contact`), Next.js goes to that page and scrolls to the section itself, as `Link` does.
 *
 * @example
 * <SectionLink href="#contact">Contact</SectionLink>
 * <SectionLink href="/en#contact">Contact</SectionLink>
 */
export function SectionLink(properties: ComponentProps<typeof Link>) {
  const here = typeof properties.href === "string" && properties.href.startsWith("#");
  return <Link {...(here ? { scroll: false } : {})} {...properties} />;
}
