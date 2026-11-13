import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const lenis = { raf: vi.fn(), scrollTo: vi.fn(), destroy: vi.fn() };
const Lenis = vi.fn(function () {
  return lenis;
});
vi.mock("lenis", () => ({ default: Lenis }));
const { SmoothScroll } = await import("@sharadox/scroll-web-library/smooth-scroll");
const { glideTo } = await import("@sharadox/scroll-web-library/glide");

const prefersReducedMotion = (reduced: boolean) =>
  vi.spyOn(window, "matchMedia").mockReturnValue({ matches: reduced } as MediaQueryList);

beforeEach(() => vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] }));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  document.body.innerHTML = "";
});

describe("SmoothScroll", () => {
  test("smooths scrolling every frame and cleans up", () => {
    prefersReducedMotion(false);
    const { unmount, container } = render(<SmoothScroll duration={1} />);
    expect(container.innerHTML).toBe("");
    expect(Lenis).toHaveBeenCalledWith({ duration: 1, smoothWheel: true });
    vi.advanceTimersByTime(50);
    expect(lenis.raf).toHaveBeenCalled();
    // Programmatic glides go through it too, and stop going through it once it is gone.
    glideTo(900, { duration: 0.7 });
    expect(lenis.scrollTo).toHaveBeenLastCalledWith(900, { duration: 0.7 });
    unmount();
    expect(lenis.destroy).toHaveBeenCalled();
    const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    glideTo(900);
    expect(scroll).toHaveBeenCalled();
  });

  test("jumps to in-page anchors above a fixed header, and ignores other clicks", () => {
    prefersReducedMotion(false);
    document.body.innerHTML =
      '<a href="#contact">Contact</a><a href="#missing">Missing</a><section id="contact"></section><span>text</span>';
    render(<SmoothScroll anchorOffset={-80} />);
    const click = (selector: string) =>
      document.querySelector(selector)!.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    expect(click('a[href="#contact"]')).toBe(false);
    expect(lenis.scrollTo).toHaveBeenCalledWith(document.getElementById("contact"), { offset: -80 });
    expect(click('a[href="#missing"]')).toBe(true);
    expect(click("span")).toBe(true);
    expect(lenis.scrollTo).toHaveBeenCalledOnce();
  });

  test("a link to the page already open glides to the top instead of reloading", () => {
    prefersReducedMotion(false);
    history.replaceState(null, "", "/en");
    document.body.innerHTML = [
      '<a id="home" href="/en/">Home</a>',
      '<a id="other" href="/pt">PT</a>',
      '<a id="tab" href="/en" target="_blank">New tab</a>',
      '<a id="query" href="/en?x=1">Query</a>',
      '<a id="hash" href="/en#top">Hash</a>',
    ].join("");
    render(<SmoothScroll />);
    const click = (id: string, init: MouseEventInit = {}) =>
      document.getElementById(id)!.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, ...init }));
    expect(click("home")).toBe(false);
    expect(lenis.scrollTo).toHaveBeenLastCalledWith(0);
    expect(click("home", { metaKey: true })).toBe(true);
    expect(click("home", { ctrlKey: true })).toBe(true);
    expect(click("home", { shiftKey: true })).toBe(true);
    expect(click("home", { altKey: true })).toBe(true);
    expect(click("home", { button: 1 })).toBe(true);
    expect(click("other")).toBe(true);
    expect(click("tab")).toBe(true);
    expect(click("query")).toBe(true);
    expect(click("hash")).toBe(true);
    expect(lenis.scrollTo).toHaveBeenCalledOnce();
  });

  test("stays off when the visitor prefers reduced motion, but still keeps same-page links from reloading", () => {
    prefersReducedMotion(true);
    history.replaceState(null, "", "/");
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    document.body.innerHTML =
      '<a id="home" href="/">Home</a><a href="#contact">Contact</a><section id="contact"></section>';
    const { unmount } = render(<SmoothScroll />);
    expect(Lenis).not.toHaveBeenCalled();
    const home = document.getElementById("home")!;
    expect(home.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))).toBe(false);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
    // Anchors are left to the browser.
    const anchor = document.querySelector('a[href="#contact"]')!;
    expect(anchor.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))).toBe(true);
    unmount();
  });
});
