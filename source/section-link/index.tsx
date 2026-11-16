import Link from "next/link";
import type { ComponentProps } from "react";

/**
 * Next.js `Link` for a section of the page (`#contact`, or `/en#contact` from another page). Next.js updates the address
 * and `SmoothScroll` does the scrolling (`scroll={false}`), so the page glides there instead of two scrolls fighting.
 *
 * @example
 * <SectionLink href="#contact">Contact</SectionLink>
 */
export function SectionLink(properties: ComponentProps<typeof Link>) {
  return <Link scroll={false} {...properties} />;
}
