// @vitest-environment happy-dom
import { afterEach, expect, test, vi } from "vitest";
import { glideTo, registerGlider } from "@sharadox/scroll-web-library/glide";

const prefersReducedMotion = (reduced: boolean) =>
  vi.spyOn(window, "matchMedia").mockReturnValue({ matches: reduced } as MediaQueryList);

afterEach(() => {
  registerGlider(null);
  vi.restoreAllMocks();
});

test("glides through the smooth scrolling while it runs", () => {
  const glider = { scrollTo: vi.fn() };
  registerGlider(glider);
  glideTo(800, { duration: 0.6 });
  expect(glider.scrollTo).toHaveBeenLastCalledWith(800, { duration: 0.6 });
  glideTo(100);
  expect(glider.scrollTo).toHaveBeenLastCalledWith(100, {});
});

test("without it, the browser glides there, or jumps when motion is unwelcome", () => {
  const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  prefersReducedMotion(false);
  glideTo(500);
  expect(scroll).toHaveBeenLastCalledWith({ top: 500, behavior: "smooth" });
  prefersReducedMotion(true);
  glideTo(500);
  expect(scroll).toHaveBeenLastCalledWith({ top: 500, behavior: "auto" });
});
