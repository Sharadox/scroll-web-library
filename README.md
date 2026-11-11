# @sharadox/scroll-web-library

Scrolling for React websites:

- **Smooth scrolling:** inertial scrolling with Lenis, including in-page anchor links that stop above a fixed header. It turns off for visitors who prefer reduced motion.
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

## Develop

`pnpm verify` runs formatting, lint, type-check, tests with 100% coverage and the build. Branches follow `<feature>.development` → `development` → `index`, and releases are `v<version>` tags on `index`.

## Licence

Licença Sharadox de Código Aberto, versão 0.1.0. See [português](LICENCA.md) (the binding text) and the [English translation](LICENSE.md).
