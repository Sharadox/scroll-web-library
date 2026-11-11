"use client";
import Lenis from "lenis";
import { useEffect } from "react";
import type { SmoothScrollProperties } from "@sharadox/scroll-web-library/smooth-scroll/type";

/** Smooth, inertial page scrolling, including in-page anchor links. Off when the visitor prefers reduced motion. */
export function SmoothScroll({ duration = 1.15, anchorOffset = -60 }: SmoothScrollProperties) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration, smoothWheel: true });
    let frame = 0;
    const animate = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      const target = link && document.querySelector<HTMLElement>(link.getAttribute("href")!);
      if (target) {
        event.preventDefault();
        lenis.scrollTo(target, { offset: anchorOffset });
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, [duration, anchorOffset]);
  return null;
}
