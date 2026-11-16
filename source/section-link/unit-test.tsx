import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { SectionLink } from "@sharadox/scroll-web-library/section-link";

test("is a link to the section, with everything else passed on", () => {
  render(
    <SectionLink href="#contact" className="link">
      Contact
    </SectionLink>,
  );
  const link = screen.getByRole("link", { name: "Contact" });
  expect(link.getAttribute("href")).toBe("#contact");
  expect(link.className).toBe("link");
});
