// @vitest-environment happy-dom
import { afterEach, expect, test, vi } from "vitest";
import { registerGlider } from "@sharadox/scroll-web-library/glide";
import { glideIntoView } from "@sharadox/scroll-web-library/glide-into-view";

const glider = { scrollTo: vi.fn() };
/** An element at this place in the window. */
const placed = (top: number, height = 200) =>
  ({ getBoundingClientRect: () => ({ top, bottom: top + height }) }) as unknown as Element;

afterEach(() => {
  registerGlider(null);
  glider.scrollTo.mockReset();
  vi.unstubAllGlobals();
});

test("leaves an element alone when it's wholly in view", () => {
  registerGlider(glider);
  vi.stubGlobal("innerHeight", 800);
  glideIntoView(placed(200));
  expect(glider.scrollTo).not.toHaveBeenCalled();
});

test("glides an element above the window, or under the bar, down into view", () => {
  registerGlider(glider);
  vi.stubGlobal("innerHeight", 800);
  vi.stubGlobal("scrollY", 3000);
  glideIntoView(placed(-500));
  expect(glider.scrollTo).toHaveBeenLastCalledWith(2404, {});
  glideIntoView(placed(40), { offset: 64, duration: 0.8 });
  expect(glider.scrollTo).toHaveBeenLastCalledWith(2976, { duration: 0.8 });
});

test("glides an element running past the bottom of the window up, never above the page's top", () => {
  registerGlider(glider);
  vi.stubGlobal("innerHeight", 800);
  vi.stubGlobal("scrollY", 0);
  glideIntoView(placed(700));
  expect(glider.scrollTo).toHaveBeenLastCalledWith(604, {});
  glideIntoView(placed(-50));
  expect(glider.scrollTo).toHaveBeenLastCalledWith(0, {});
});
