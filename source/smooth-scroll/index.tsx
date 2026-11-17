"use client";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { registerGlider } from "@sharadox/scroll-web-library/glide";
import type { SmoothScrollProperties } from "@sharadox/scroll-web-library/smooth-scroll/type";

/** Milliseconds after a page opens while Next.js places it (at the top, an anchor or where it was). */
const SETTLING = 300;

/**
 * Stops the smoothing of the page that came before. Next.js may keep that page a moment after the new one appears; its
 * smoothing must not go on moving the new page towards where the old one was headed.
 */
let stopPrevious: (() => void) | null = null;

/** A path without its trailing slash, so "/en/" and "/en" count as the same page. */
const page = (path: string) => path.replace(/(.)\/$/, "$1");

/**
 * Smooth, inertial page scrolling, including in-page anchor links (plain ones and `SectionLink`s) and `#top`, which
 * glides to the top of whatever page is open. A link to the page already open (the logo on the home page, for one)
 * glides back to the top instead of reloading. Smoothing is off when the visitor prefers reduced motion: anchors then
 * jump, and the same-page link still goes to the top without reloading. It works in a page or in a layout. A page's smoothing stops as soon as the
 * address is another page's, and only one page smooths at a time; a new page leaves the wheel and touch alone for a moment while
 * Next.js places it. So a glide still under way from the previous page (a trackpad's momentum, say) can't send the new
 * page to the old page's place.
 */
export function SmoothScroll({ duration = 1.15, anchorOffset = -60 }: SmoothScrollProperties) {
  // In a layout, it stays mounted from page to page: each page gets smoothing of its own.
  const pathname = usePathname();
  useEffect(() => {
    stopPrevious?.();
    // While the page is being placed, wheel and touch events still belong to the previous page's gesture; once the
    // address is another page's (a link, or back and forward), this page's smoothing has nothing more to do.
    const opened = performance.now();
    const path = page(location.pathname);
    const here = () => page(location.pathname) === path;
    const listening = () => here() && performance.now() - opened >= SETTLING;
    const lenis = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? null
      : new Lenis({ duration, smoothWheel: true, virtualScroll: listening });
    let frame = 0;
    const animate = (time: number) => {
      if (here()) lenis!.raf(time);
      frame = requestAnimationFrame(animate);
    };
    if (lenis) frame = requestAnimationFrame(animate);
    // glideTo moves the page through it, so programmatic moves ease like the visitor's own.
    registerGlider(lenis && { scrollTo: (top, options) => lenis.scrollTo(top, options) });
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const href = link.getAttribute("href")!;
      if (href.startsWith("#")) {
        // "#top" is the top of any page, as in browsers; other anchors are the element with that id.
        const anchor = href === "#top" ? document.documentElement : document.querySelector<HTMLElement>(href);
        if (!anchor) return;
        // A `SectionLink` (Next.js Link that leaves scrolling to us) has already taken the click: scroll even then.
        if (!lenis && !event.defaultPrevented) return;
        event.preventDefault();
        if (anchor === document.documentElement) {
          if (lenis) lenis.scrollTo(0);
          else window.scrollTo({ top: 0, behavior: "auto" });
        } else if (lenis) lenis.scrollTo(anchor, { offset: anchorOffset });
        else anchor.scrollIntoView();
        return;
      }
      // A plain click on a link to this very page: back to the top, no reload.
      const samePage =
        link.origin === location.origin &&
        page(link.pathname) === page(location.pathname) &&
        !link.hash &&
        !link.search;
      const plainClick = event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
      if (samePage && plainClick && !link.target) {
        event.preventDefault();
        if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: "auto" });
      }
    };
    document.addEventListener("click", onClick);
    const stop = () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", onClick);
      lenis?.destroy();
    };
    stopPrevious = stop;
    return () => {
      // Already stopped (and replaced) if a newer page took over; otherwise this page is the one leaving.
      if (stopPrevious !== stop) return;
      stop();
      stopPrevious = null;
      registerGlider(null);
    };
  }, [duration, anchorOffset, pathname]);
  return null;
}
