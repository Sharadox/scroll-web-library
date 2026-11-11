export interface SmoothScrollProperties {
  /** Seconds a scroll gesture takes to settle. Defaults to 1.15. */
  duration?: number;
  /** Pixels to stop above an in-page anchor target (for a fixed header). Defaults to -60. */
  anchorOffset?: number;
}
