"use client";
import { useEffect, type RefObject } from "react";
import { glideTo } from "@sharadox/scroll-web-library/glide";
import type { ScrollStepsOptions } from "@sharadox/scroll-web-library/scroll-steps/type";

/** A pause this long between wheel events starts a new gesture. */
const GESTURE_GAP = 180;
/** How far a finger must travel to count as a swipe. */
const SWIPE = 30;

/**
 * For a tall pinned section that shows `count` steps one after another as the page scrolls through it: while it is
 * pinned, each scroll gesture (a wheel turn, a trackpad swipe, a finger swipe) moves exactly one step, gliding to
 * that step's place, instead of taking many to get there. Past the first or last step the page scrolls on as usual.
 * Keyboard and scrollbar scrolling are left alone. Step `index` sits in the middle of its share of the section.
 *
 * @example
 * const section = useRef<HTMLElement>(null);
 * useScrollSteps(section, 7);
 */
export function useScrollSteps<Element extends HTMLElement>(
  section: RefObject<Element | null>,
  count: number,
  { duration = 0.9 }: ScrollStepsOptions = {},
) {
  useEffect(() => {
    let lastWheel = 0;
    let lockedUntil = 0;
    let touchY: number | null = null;
    // Where the section's step `index` is, and which step the page shows now, while the section is pinned.
    const place = () => {
      const element = section.current;
      if (!element) return null;
      const bounds = element.getBoundingClientRect();
      const travel = element.offsetHeight - innerHeight;
      if (travel <= 0 || bounds.top > 1 || bounds.bottom < innerHeight - 1) return null;
      const top = bounds.top + scrollY;
      const progress = (scrollY - top) / travel;
      return {
        current: Math.min(count - 1, Math.max(0, Math.floor(progress * count))),
        at: (index: number) => top + ((index + 0.5) / count) * travel,
      };
    };
    // Moves one step in `direction` if there is one; true when the gesture was taken.
    const step = (direction: 1 | -1, now: number) => {
      const where = place();
      if (!where) return false;
      const next = where.current + direction;
      if (next < 0 || next >= count) return false;
      if (now >= lockedUntil) {
        lockedUntil = now + duration * 1000;
        glideTo(where.at(next), { duration });
      }
      return true;
    };
    const wheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      const now = event.timeStamp;
      const fresh = now - lastWheel > GESTURE_GAP;
      lastWheel = now;
      const where = place();
      if (!where) return;
      const direction = event.deltaY > 0 ? 1 : -1;
      const next = where.current + direction;
      if (next < 0 || next >= count) return;
      // Inside the steps the gesture is ours: the page doesn't scroll by it, and only a new gesture moves again.
      event.preventDefault();
      event.stopPropagation();
      if (fresh) step(direction, now);
    };
    const touchStart = (event: TouchEvent) => {
      touchY = event.touches[0]!.clientY;
    };
    const touchMove = (event: TouchEvent) => {
      if (touchY === null) return;
      const where = place();
      const direction = touchY - event.touches[0]!.clientY > 0 ? 1 : -1;
      if (where && where.current + direction >= 0 && where.current + direction < count) event.preventDefault();
    };
    const touchEnd = (event: TouchEvent) => {
      if (touchY === null) return;
      const travel = touchY - event.changedTouches[0]!.clientY;
      touchY = null;
      if (Math.abs(travel) >= SWIPE) step(travel > 0 ? 1 : -1, event.timeStamp);
    };
    const options = { capture: true, passive: false };
    addEventListener("wheel", wheel, options);
    addEventListener("touchstart", touchStart, options);
    addEventListener("touchmove", touchMove, options);
    addEventListener("touchend", touchEnd, options);
    return () => {
      removeEventListener("wheel", wheel, options);
      removeEventListener("touchstart", touchStart, options);
      removeEventListener("touchmove", touchMove, options);
      removeEventListener("touchend", touchEnd, options);
    };
  }, [section, count, duration]);
}
