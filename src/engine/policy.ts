/**
 * Auto-apply policy thresholds.
 *
 * `SPEC_MIN_AUTO_APPLY_CONFIDENCE` is the target defined by the grammar-engine
 * spec (§3.2): a candidate is only auto-applied when its confidence clears this
 * bar AND the backing rule opts in with `autoApply === true`.
 *
 * `DEFAULT_MIN_AUTO_APPLY_CONFIDENCE` is what the engine uses when the caller
 * does not override it. It is intentionally kept at the historical 0.95 so the
 * benchmark can measure the difference before the stricter policy is adopted.
 */
export const SPEC_MIN_AUTO_APPLY_CONFIDENCE = 0.98;
export const DEFAULT_MIN_AUTO_APPLY_CONFIDENCE = 0.95;
