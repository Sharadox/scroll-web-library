"use client";
import { useEffect, useState } from "react";

/**
 * Whether the page has scrolled past a point, kept up to date as it scrolls: a distance in pixels, or a function of
 * the window's height (`(height) => height * 0.6`, past most of the first screen). False until the page has loaded.
 * For a bar that turns solid once the page moves, or an action that appears below the hero.
 *
 * @example
 * const scrolled = useScrolledPast(24);
 */
export function useScrolledPast(point: number | ((windowHeight: number) => number)): boolean {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const update = () => setPast(scrollY > (typeof point === "number" ? point : point(innerHeight)));
    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update, { passive: true });
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, [point]);
  return past;
}
