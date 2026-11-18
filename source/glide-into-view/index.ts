import { glideTo } from "@sharadox/scroll-web-library/glide";
import type { GlideIntoViewOptions } from "@sharadox/scroll-web-library/glide-into-view/type";

/**
 * Brings an element into view when it isn't wholly in view already: the page glides (through the smooth scrolling,
 * like every other move) until the element's top sits `offset` pixels below the top of the window, clear of a fixed
 * bar. For something that appears in place of something taller, such as a form's thank-you after sending on a phone.
 *
 * @example
 * <div ref={(element) => element && glideIntoView(element)}>Thank you</div>
 */
export function glideIntoView(element: Element, { offset = 96, duration }: GlideIntoViewOptions = {}) {
  const box = element.getBoundingClientRect();
  if (box.top >= offset && box.bottom <= innerHeight) return;
  glideTo(Math.max(0, box.top + scrollY - offset), duration === undefined ? {} : { duration });
}
