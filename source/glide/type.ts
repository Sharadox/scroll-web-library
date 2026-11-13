/** What moves the page smoothly: the smooth scrolling `SmoothScroll` starts, while it runs. */
export interface Glider {
  scrollTo: (top: number, options?: { duration?: number }) => void;
}

export interface GlideOptions {
  /** How long the glide takes, in seconds (with smooth scrolling). */
  duration?: number;
}
