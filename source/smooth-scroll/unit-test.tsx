import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const lenis = { raf: vi.fn(), scrollTo: vi.fn(), destroy: vi.fn(), isScrolling: false as false | "smooth" };
const Lenis = vi.fn(function () {
  return lenis;
});
vi.mock("lenis", () => ({ default: Lenis }));
let pathname = "/en";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
const { SmoothScroll } = await import("@sharadox/scroll-web-library/smooth-scroll");
const { glideTo } = await import("@sharadox/scroll-web-library/glide");

const prefersReducedMotion = (reduced: boolean) =>
  vi.spyOn(window, "matchMedia").mockReturnValue({ matches: reduced } as MediaQueryList);

beforeEach(() => vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame", "performance"] }));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  document.body.innerHTML = "";
});

describe("SmoothScroll", () => {
  test("a new page stops the previous page's smoothing at once, and keeps its own when the old one leaves", () => {
    prefersReducedMotion(false);
    const previous = render(<SmoothScroll />);
    render(<SmoothScroll />);
    expect(lenis.destroy).toHaveBeenCalledOnce();
    previous.unmount();
    expect(lenis.destroy).toHaveBeenCalledOnce();
    // The new page's glides still go through its smoothing.
    glideTo(500);
    expect(lenis.scrollTo).toHaveBeenLastCalledWith(500, {});
  });

  test("stops smoothing as soon as the address is another page's", () => {
    prefersReducedMotion(false);
    history.replaceState(null, "", "/en");
    render(<SmoothScroll />);
    const { virtualScroll } = (Lenis.mock.calls.at(-1) as unknown as [{ virtualScroll: () => boolean }])[0];
    vi.advanceTimersByTime(300);
    expect(virtualScroll()).toBe(true);
    // A new hash or query is still this page.
    history.replaceState(null, "", "/en/?x=1#contact");
    expect(virtualScroll()).toBe(true);
    history.replaceState(null, "", "/en/services");
    expect(virtualScroll()).toBe(false);
    lenis.raf.mockClear();
    vi.advanceTimersByTime(50);
    expect(lenis.raf).not.toHaveBeenCalled();
    history.replaceState(null, "", "/en");
  });

  test("in a layout, starts smoothing afresh for every page", () => {
    prefersReducedMotion(false);
    history.replaceState(null, "", "/en");
    const { rerender } = render(<SmoothScroll />);
    history.replaceState(null, "", "/en/services");
    pathname = "/en/services";
    rerender(<SmoothScroll />);
    expect(lenis.destroy).toHaveBeenCalledOnce();
    expect(Lenis).toHaveBeenCalledTimes(2);
    const { virtualScroll } = (Lenis.mock.calls.at(-1) as unknown as [{ virtualScroll: () => boolean }])[0];
    vi.advanceTimersByTime(300);
    expect(virtualScroll()).toBe(true);
    pathname = "/en";
    history.replaceState(null, "", "/en");
  });

  test("leaves the wheel and touch alone while the page is being placed", () => {
    prefersReducedMotion(false);
    render(<SmoothScroll />);
    const { virtualScroll } = (Lenis.mock.calls.at(-1) as unknown as [{ virtualScroll: () => boolean }])[0];
    expect(virtualScroll()).toBe(false);
    vi.advanceTimersByTime(300);
    expect(virtualScroll()).toBe(true);
  });

  test("rests while the page sits still, and wakes for a wheel, a scroll or a glide until the page settles", () => {
    prefersReducedMotion(false);
    render(<SmoothScroll />);
    const { virtualScroll } = (Lenis.mock.calls.at(-1) as unknown as [{ virtualScroll: () => boolean }])[0];
    vi.advanceTimersByTime(1000);
    // Settled: no frame waits any more.
    lenis.raf.mockClear();
    vi.advanceTimersByTime(500);
    expect(lenis.raf).not.toHaveBeenCalled();
    // A wheel the smoothing takes wakes it, and it keeps going while the page glides.
    expect(virtualScroll()).toBe(true);
    lenis.isScrolling = "smooth";
    vi.advanceTimersByTime(1000);
    expect(lenis.raf.mock.calls.length).toBeGreaterThan(30);
    lenis.isScrolling = false;
    vi.advanceTimersByTime(1000);
    lenis.raf.mockClear();
    vi.advanceTimersByTime(500);
    expect(lenis.raf).not.toHaveBeenCalled();
    // A native scroll (a keyboard, the scrollbar) and a glide wake it too.
    dispatchEvent(new Event("scroll"));
    vi.advanceTimersByTime(50);
    expect(lenis.raf).toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    lenis.raf.mockClear();
    glideTo(400);
    vi.advanceTimersByTime(50);
    expect(lenis.raf).toHaveBeenCalled();
  });

  test("smooths scrolling every frame and cleans up", () => {
    prefersReducedMotion(false);
    const { unmount, container } = render(<SmoothScroll duration={1} />);
    expect(container.innerHTML).toBe("");
    expect(Lenis).toHaveBeenCalledWith({ duration: 1, smoothWheel: true, virtualScroll: expect.any(Function) });
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

  test("#top glides to the top of the page that is open", () => {
    prefersReducedMotion(false);
    document.body.innerHTML = '<a href="#top">Back to top</a>';
    render(<SmoothScroll />);
    const link = document.querySelector("a")!;
    expect(link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))).toBe(false);
    expect(lenis.scrollTo).toHaveBeenLastCalledWith(0);
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
    expect(click("tab")).toBe(true);
    expect(click("query")).toBe(true);
    expect(click("hash")).toBe(true);
    expect(click("other")).toBe(true);
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
    // Anchors are left to the browser...
    const anchor = document.querySelector('a[href="#contact"]')!;
    expect(anchor.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))).toBe(true);
    // ...unless a SectionLink already took the click: then they jump here, and #top goes to the top.
    const section = document.getElementById("contact")!;
    section.scrollIntoView = vi.fn();
    const taken = (link: Element) => {
      const click = new MouseEvent("click", { bubbles: true, cancelable: true });
      link.addEventListener("click", (event) => event.preventDefault(), { once: true });
      link.dispatchEvent(click);
    };
    taken(anchor);
    expect(section.scrollIntoView).toHaveBeenCalled();
    document.body.insertAdjacentHTML("beforeend", '<a id="top-link" href="#top">Top</a>');
    taken(document.getElementById("top-link")!);
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: "auto" });
    unmount();
  });
});
