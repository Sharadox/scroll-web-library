import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { useActiveSection } from "@sharadox/scroll-web-library/active-section";

const place = (id: string, top: number, height: number) => {
  const element = document.createElement("section");
  element.id = id;
  element.getBoundingClientRect = () => ({ top, height }) as DOMRect;
  document.body.append(element);
  return element;
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] });
  vi.stubGlobal("innerHeight", 800);
  Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 2800 });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

test("reports the section under the middle of the screen, how far through it, and page progress", () => {
  place("home", -500, 800);
  const services = place("services", 300, 400);
  vi.stubGlobal("scrollY", 1000);
  const ids = ["home", "services", "missing"];
  const { result, unmount } = renderHook(() => useActiveSection(ids));
  act(() => vi.advanceTimersByTime(20));
  expect(result.current).toEqual({ active: "services", within: 0.25, page: 0.5 });
  services.getBoundingClientRect = () => ({ top: 300, height: 400 }) as DOMRect;
  act(() => {
    dispatchEvent(new Event("scroll"));
    dispatchEvent(new Event("scroll"));
    vi.advanceTimersByTime(20);
  });
  expect(result.current.active).toBe("services");
  act(() => {
    services.getBoundingClientRect = () => ({ top: 900, height: 400 }) as DOMRect;
    dispatchEvent(new Event("resize"));
    vi.advanceTimersByTime(20);
  });
  expect(result.current.active).toBe("home");
  unmount();
});

test("starts on the first section and copes with a page that doesn't scroll", () => {
  Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 800 });
  vi.stubGlobal("scrollY", 0);
  place("top", 900, 0);
  const { result } = renderHook(() => useActiveSection(["top"]));
  act(() => vi.advanceTimersByTime(20));
  expect(result.current).toEqual({ active: "top", within: 0, page: 0 });
});

test("handles an empty list", () => {
  const { result } = renderHook(() => useActiveSection([]));
  act(() => vi.advanceTimersByTime(20));
  expect(result.current.active).toBe("");
});
