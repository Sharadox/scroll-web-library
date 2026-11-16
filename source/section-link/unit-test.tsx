import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

const Link = vi.fn((properties: Record<string, unknown>) => (
  <a href={String(properties.href)}>{String(properties.children)}</a>
));
vi.mock("next/link", () => ({ default: Link }));
const { SectionLink } = await import("@sharadox/scroll-web-library/section-link");

test("leaves a section on this page to SmoothScroll, and lets Next.js scroll to one on another page", () => {
  render(
    <>
      <SectionLink href="#contact" className="link">
        Here
      </SectionLink>
      <SectionLink href="/en#contact">There</SectionLink>
      <SectionLink href={{ pathname: "/en", hash: "contact" }}>Object</SectionLink>
    </>,
  );
  expect(screen.getByRole("link", { name: "Here" }).getAttribute("href")).toBe("#contact");
  expect(Link.mock.calls[0]![0]).toMatchObject({ scroll: false, className: "link" });
  expect(Link.mock.calls[1]![0]).not.toHaveProperty("scroll");
  expect(Link.mock.calls[2]![0]).not.toHaveProperty("scroll");
});
