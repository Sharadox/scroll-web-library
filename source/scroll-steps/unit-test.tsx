// @vitest-environment happy-dom
import { cleanup, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { registerGlider } from "@sharadox/scroll-web-library/glide";
import { useScrollSteps } from "@sharadox/scroll-web-library/scroll-steps";

const glider = { scrollTo: vi.fn() };

/** A section 6 900 px tall (6 000 px of travel on a 900 px screen) starting 1 000 px down, with 6 steps. */
function Steps({ count = 6 }: { count?: number }) {
  const section = useRef<HTMLElement>(null);
  useScrollSteps(section, count, { duration: 0.5 });
  return <section ref={section} />;
}
const at = (top: number) => {
  vi.stubGlobal("scrollY", top);
  const section = document.querySelector("section")!;
  section.getBoundingClientRect = () => ({ top: 1000 - top, bottom: 7900 - top }) as DOMRect;
};
const wheel = (deltaY: number, timeStamp: number, deltaX = 0) => {
  const event = new WheelEvent("wheel", { deltaY, deltaX, cancelable: true, bubbles: true });
  Object.defineProperty(event, "timeStamp", { value: timeStamp });
  document.body.dispatchEvent(event);
  return event;
};
const touch = (type: string, clientY: number, timeStamp = 0) => {
  const event = new Event(type, { cancelable: true, bubbles: true });
  Object.defineProperties(event, {
    touches: { value: [{ clientY }] },
    changedTouches: { value: [{ clientY }] },
    timeStamp: { value: timeStamp },
  });
  document.body.dispatchEvent(event);
  return event;
};

beforeEach(() => {
  registerGlider(glider);
  vi.stubGlobal("innerHeight", 900);
});
afterEach(() => {
  cleanup();
  registerGlider(null);
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

test("one wheel gesture moves one step, gliding to its middle; the rest of the gesture is held", () => {
  render(<Steps />);
  Object.defineProperty(document.querySelector("section")!, "offsetHeight", { value: 6900 });
  at(1000);
  const first = wheel(40, 1000);
  expect(first.defaultPrevented).toBe(true);
  // Step 1 sits at 1000 + 1.5/6 of 6000.
  expect(glider.scrollTo).toHaveBeenLastCalledWith(2500, { duration: 0.5 });
  // The same gesture carrying on (no pause) doesn't move again, even once the glide is over.
  for (const time of [1150, 1300, 1450, 1600]) wheel(30, time);
  expect(glider.scrollTo).toHaveBeenCalledTimes(1);
  at(2500);
  glider.scrollTo.mockClear();
  wheel(40, 1900);
  wheel(-40, 2200);
  // 1 900 is a new gesture (a pause before it) after the glide: on to step 2; 2 200 is held, as that glide runs.
  expect(glider.scrollTo).toHaveBeenCalledTimes(1);
  expect(glider.scrollTo).toHaveBeenLastCalledWith(3500, { duration: 0.5 });
  wheel(-40, 2700);
  expect(glider.scrollTo).toHaveBeenLastCalledWith(1500, { duration: 0.5 });
});

test("past the first and last step, and outside the section, the page scrolls as usual", () => {
  render(<Steps />);
  Object.defineProperty(document.querySelector("section")!, "offsetHeight", { value: 6900 });
  at(1000);
  expect(wheel(-40, 1000).defaultPrevented).toBe(false);
  at(6999);
  expect(wheel(40, 2000).defaultPrevented).toBe(false);
  // Before the section is pinned.
  at(500);
  expect(wheel(40, 3000).defaultPrevented).toBe(false);
  // Sideways gestures are not for it.
  at(1000);
  expect(wheel(5, 4000, 60).defaultPrevented).toBe(false);
  expect(glider.scrollTo).not.toHaveBeenCalled();
});

test("a finger swipe moves one step, once the touch event is over; short touches and swipes past the ends don't", async () => {
  render(<Steps />);
  Object.defineProperty(document.querySelector("section")!, "offsetHeight", { value: 6900 });
  at(1000);
  touch("touchstart", 600);
  expect(touch("touchmove", 500).defaultPrevented).toBe(true);
  touch("touchend", 400, 100);
  // Smooth scrolling still handles the same touch end: the glide waits until it has.
  expect(glider.scrollTo).not.toHaveBeenCalled();
  await new Promise((resolve) => setTimeout(resolve));
  expect(glider.scrollTo).toHaveBeenLastCalledWith(2500, { duration: 0.5 });
  touch("touchstart", 600);
  touch("touchend", 590, 2000);
  expect(glider.scrollTo).toHaveBeenCalledTimes(1);
  // Swiping back from the first step leaves the section.
  touch("touchstart", 400);
  expect(touch("touchmove", 500).defaultPrevented).toBe(false);
  touch("touchend", 600, 3000);
  expect(glider.scrollTo).toHaveBeenCalledTimes(1);
  // Moves and ends without a start, or with the section gone, do nothing.
  touch("touchmove", 500);
  touch("touchend", 500);
  at(500);
  touch("touchstart", 600);
  touch("touchmove", 500);
  touch("touchend", 300, 4000);
  await new Promise((resolve) => setTimeout(resolve));
  expect(glider.scrollTo).toHaveBeenCalledTimes(1);
});

test("a section no taller than the screen, or gone, has no steps", () => {
  const { unmount } = render(<Steps />);
  Object.defineProperty(document.querySelector("section")!, "offsetHeight", { value: 900 });
  at(1000);
  expect(wheel(40, 1000).defaultPrevented).toBe(false);
  unmount();
  function Missing() {
    const section = useRef<HTMLElement>(null);
    useScrollSteps(section, 3);
    return null;
  }
  render(<Missing />);
  expect(wheel(40, 2000).defaultPrevented).toBe(false);
});
