import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const lenis = { raf: vi.fn(), scrollTo: vi.fn(), destroy: vi.fn() };
const Lenis = vi.fn(function () {
  return lenis;
});
vi.mock("lenis", () => ({ default: Lenis }));
const { SmoothScroll } = await import("@sharadox/scroll-web-library/smooth-scroll");

const prefersReducedMotion = (reduced: boolean) =>
  vi.spyOn(window, "matchMedia").mockReturnValue({ matches: reduced } as MediaQueryList);

beforeEach(() => vi.useFakeTimers({ toFake: ["requestAnimationFrame", "cancelAnimationFrame"] }));
afterEach(() => {
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
    unmount();
    expect(lenis.destroy).toHaveBeenCalled();
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

  test("stays off when the visitor prefers reduced motion", () => {
    prefersReducedMotion(true);
    render(<SmoothScroll />);
    expect(Lenis).not.toHaveBeenCalled();
  });
});
