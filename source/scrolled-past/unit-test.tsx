import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { useScrolledPast } from "@sharadox/scroll-web-library/scrolled-past";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const scrollTo = (y: number) =>
  act(() => {
    vi.stubGlobal("scrollY", y);
    window.dispatchEvent(new Event("scroll"));
  });

test("follows the page past a distance in pixels", () => {
  const { result, unmount } = renderHook(() => useScrolledPast(24));
  expect(result.current).toBe(false);
  scrollTo(30);
  expect(result.current).toBe(true);
  scrollTo(10);
  expect(result.current).toBe(false);
  unmount();
});

test("follows a point measured from the window's height, also when the window changes", () => {
  vi.stubGlobal("innerHeight", 1000);
  const point = (height: number) => height * 0.6;
  const { result } = renderHook(() => useScrolledPast(point));
  scrollTo(700);
  expect(result.current).toBe(true);
  act(() => {
    vi.stubGlobal("innerHeight", 2000);
    window.dispatchEvent(new Event("resize"));
  });
  expect(result.current).toBe(false);
});
