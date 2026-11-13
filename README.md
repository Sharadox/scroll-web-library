# @sharadox/scroll-web-library

Scrolling for React websites:

- **Smooth scrolling:** inertial scrolling with Lenis, including in-page anchor links that stop above a fixed header. A link to the page already open (the logo on the home page) glides back to the top instead of reloading. Smoothing turns off for visitors who prefer reduced motion; same-page links still skip the reload.
- **Glide:** `glideTo(top)` moves the page through the smooth scrolling, so code-driven moves ease like the visitor's own.
- **Scroll steps:** `useScrollSteps(section, count)` gives a tall pinned section that shows steps one after another (a timelapse, a story) one step per scroll gesture: one wheel turn, trackpad swipe or finger swipe. It doesn't take many to get from one step to the next.
- **Active section:** which section holds the middle of the screen, how far through it you are, and how far down the page. That's what section indicators and progress bars need.

## Install

```sh
pnpm add @sharadox/scroll-web-library
```

## API

| Import             | Export                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| `…/smooth-scroll`  | `<SmoothScroll duration? anchorOffset?>` (renders nothing; default 1.15 s and -60 px)                   |
| `…/active-section` | `useActiveSection(ids)` → `{ active, within, page }` (keep `ids` stable, for example a module constant) |
| `…/glide`          | `glideTo(top, { duration? })`                                                                           |
| `…/scroll-steps`   | `useScrollSteps(sectionRef, count, { duration? })` (0.9 s by default)                                   |

## Develop

`pnpm verify` runs formatting, lint, type-check, tests with 100% coverage and the build. Branches follow `<feature>.development` → `development` → `index`, and releases are `v<version>` tags on `index`.

## License

Licença Sharadox de Código Aberto, versão 0.1.0. See [português](LICENCA.md) (the binding text) and the [English translation](LICENSE.md).
