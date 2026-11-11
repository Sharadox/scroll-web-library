"use client";
import { useEffect, useState } from "react";
import type { ActiveSection } from "@sharadox/scroll-web-library/active-section/type";

/**
 * Follows the scroll: which of the sections (by element id, in page order) holds the middle of the screen, how far
 * through it, and how far down the page. For section indicators and progress bars.
 */
export function useActiveSection(ids: readonly string[]): ActiveSection {
  const [state, setState] = useState<ActiveSection>({ active: ids[0] ?? "", within: 0, page: 0 });
  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const middle = innerHeight / 2;
      let active = ids[0] ?? "";
      let within = 0;
      for (const id of ids) {
        const element = document.getElementById(id);
        if (!element) continue;
        const bounds = element.getBoundingClientRect();
        if (bounds.top <= middle) {
          active = id;
          within = Math.min(1, Math.max(0, (middle - bounds.top) / Math.max(1, bounds.height)));
        }
      }
      const scrollable = document.documentElement.scrollHeight - innerHeight;
      const page = scrollable > 0 ? Math.min(1, scrollY / scrollable) : 0;
      setState((previous) =>
        previous.active === active &&
        Math.abs(previous.within - within) < 0.002 &&
        Math.abs(previous.page - page) < 0.002
          ? previous
          : { active, within, page },
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    schedule();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, [ids]);
  return state;
}
