import type { GlideOptions, Glider } from "@sharadox/scroll-web-library/glide/type";

let glider: Glider | null = null;

/** Called by `SmoothScroll` with its smooth scrolling while it runs, and with null when it stops. */
export function registerGlider(next: Glider | null) {
  glider = next;
}

/**
 * Moves the page to `top` (pixels from the top of the page): through the smooth scrolling when it runs, so the
 * move eases like every other; otherwise the browser glides there, or jumps when the visitor prefers reduced motion.
 *
 * @example
 * glideTo(section.offsetTop, { duration: 0.9 });
 */
export function glideTo(top: number, { duration }: GlideOptions = {}) {
  if (glider) return glider.scrollTo(top, duration === undefined ? {} : { duration });
  const smooth = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
}
