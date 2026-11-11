export interface ActiveSection {
  /** The id of the section the middle of the screen is in. */
  active: string;
  /** How far through the active section the middle of the screen is, 0–1. */
  within: number;
  /** How far down the whole page the visitor is, 0–1. */
  page: number;
}
