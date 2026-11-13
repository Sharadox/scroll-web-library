"use client";
import Lenis from "lenis";
import { useEffect } from "react";
import { registerGlider } from "@sharadox/scroll-web-library/glide";
import type { SmoothScrollProperties } from "@sharadox/scroll-web-library/smooth-scroll/type";

/** A path without its trailing slash, so "/en/" and "/en" count as the same page. */
const page = (path: string) => path.replace(/(.)\/$/, "$1");

/**
 * Smooth, inertial page scrolling, including in-page anchor links. A link to the page already open (the logo on the
 * home page, for one) glides back to the top instead of reloading. Smoothing is off when the visitor prefers reduced
 * motion: anchors then jump, and the same-page link still goes to the top without reloading.
 */
export function SmoothScroll({ duration = 1.15, anchorOffset = -60 }: SmoothScrollProperties) {
  useEffect(() => {
    const lenis = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? null
      : new Lenis({ duration, smoothWheel: true });
    let frame = 0;
    const animate = (time: number) => {
      lenis!.raf(time);
      frame = requestAnimationFrame(animate);
    };
    if (lenis) frame = requestAnimationFrame(animate);
    // glideTo moves the page through it, so programmatic moves ease like the visitor's own.
    registerGlider(lenis && { scrollTo: (top, options) => lenis.scrollTo(top, options) });
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
      if (!link) return;
      const anchor = link.getAttribute("href")!.startsWith("#")
        ? document.querySelector<HTMLElement>(link.getAttribute("href")!)
        : null;
      if (anchor) {
        if (!lenis) return;
        event.preventDefault();
        lenis.scrollTo(anchor, { offset: anchorOffset });
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
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", onClick);
      lenis?.destroy();
      registerGlider(null);
    };
  }, [duration, anchorOffset]);
  return null;
}
