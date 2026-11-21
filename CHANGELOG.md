# Changelog

What changed in each version of `@sharadox/scroll-web-library`, newest first.

## 0.7.2

Smooth scrolling only works while the page moves: between scrolls it rests (it asked for a frame every frame, forever, which kept the browser rebuilding the page) and wakes on the next wheel, touch, scroll or glide, its clock caught up first so the first glide after a rest is as smooth as any. Scrolling looks and feels the same.

## 0.7.1

SmoothScroll no longer imports its page CSS: a global stylesheet imported from a library changed the order Next.js loads a site's styles in (the Sharadox home page moved by 16 pixels in its visual tests). Sites keep those few rules in their own global stylesheet.

## 0.7.0

SmoothScroll brings the page CSS Lenis needs (html.lenis heights, no browser smoothing while it runs, nothing scrolls while stopped), so sites drop their copies; built with library-build so the stylesheet ships; useScrolledPast; current library versions

## 0.4.1

SectionLink leaves Next.js scrolling on for sections of other pages ("/en#contact"), so they land on the section

## 0.4.0

SectionLink; SmoothScroll handles "#top" (top of the open page) and anchors whose click a Next.js Link already took; next is a peer dependency

## 0.3.1

A finger swipe's step glide starts after the touch event, so smooth scrolling (Lenis) no longer stops it on phones

## 0.3.0

Glide, scroll-steps
