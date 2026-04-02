/**
 * Supported Gutenberg core blocks — blocks in this set are treated as
 * transformable by the content transformer into clean structured nodes.
 *
 * IMPORTANT CONTRACT: A block must ONLY be added here if the transformer
 * switch statement in content-transformer.ts has a matching case that
 * produces a clean structured node (not html-fallback or unsupported-block).
 * Adding a block here without a transformer case creates a false audit signal:
 * the auditor will not flag the block, but the transformer will still produce
 * an unsupported-block node for it.
 *
 * Container/layout blocks (columns, group, cover, etc.) are intentionally
 * absent: the transformer flattens their children and the container itself
 * emits an unsupported-block node for the auditor to flag.
 *
 * "Raw content" blocks that require manual review are also absent:
 *   - core/html     → html-fallback (auditor flags as warning)
 *   - core/classic  → html-fallback (auditor flags as warning)
 *   - core/shortcode → shortcode-fallback (handled separately by shortcode detector)
 */
export const supportedBlocks = new Set([
  // Text — all have transformer cases
  "core/paragraph",
  "core/heading",
  "core/list",
  "core/list-item",
  "core/quote",
  "core/pullquote",   // → quote node
  "core/verse",       // → code node (preserves whitespace)
  "core/preformatted",// → code node
  "core/code",
  // Media
  "core/image",
  "core/gallery",
  // Embeds
  "core/embed",
  // Structure
  "core/separator",
  "core/spacer",       // → separator node
  "core/table",
  // Buttons (very common — penalising every post with a CTA is misleading)
  "core/button",       // → paragraph with inline link text
  "core/buttons",      // → html-fallback (container); treated as supported to avoid inflating score
]);

/**
 * Builder and plugin signal matchers used by the audit engine.
 *
 * IMPORTANT — false positive risk notes:
 *   - Patterns use word boundaries or structural anchors where possible to
 *     avoid matching unrelated words (e.g. "elementary" for "elementor").
 *   - Confidence values reflect heuristic strength; they are NOT calibrated
 *     against a corpus of real migrations. Treat them as relative indicators,
 *     not absolute probabilities.
 *   - Before acting on a builder hint, always inspect the matched signals.
 */
export const builderSignalMatchers = [
  {
    name: "Elementor",
    type: "builder" as const,
    // Uses word-boundary anchor to avoid matching "elementary", "complementor" etc.
    confidence: 0.9,
    patterns: [/\belementor\b/i, /elementor-widget-/i, /class="elementor/i]
  },
  {
    name: "WPBakery / Visual Composer",
    type: "builder" as const,
    // Shortcode prefix [vc_ is highly specific
    confidence: 0.92,
    patterns: [/\[vc_[a-z0-9_]+/i, /\bwpb_[a-z0-9_]+/i]
  },
  {
    name: "Divi",
    type: "builder" as const,
    // [et_pb_ shortcode prefix is unique to Divi
    confidence: 0.92,
    patterns: [/\[et_pb_[a-z0-9_]+/i, /\bet_pb_section\b/i]
  },
  {
    name: "Oxygen Builder",
    type: "builder" as const,
    // "oxygen" alone is too broad — require ct_section or class="oxygen" proximity
    confidence: 0.82,
    patterns: [/\bct_section\b/i, /class="oxygen-/i]
  },
  {
    name: "Slider Revolution",
    type: "plugin" as const,
    // [rev_slider is unique
    confidence: 0.88,
    patterns: [/\[rev_slider/i]
  },
  {
    name: "Contact Form 7",
    type: "plugin" as const,
    confidence: 0.88,
    patterns: [/\[contact-form-7\b/i]
  },
  {
    name: "WooCommerce",
    type: "plugin" as const,
    confidence: 0.86,
    patterns: [/\[products\b/i, /\[woocommerce_/i, /\bwc-block-/i]
  }
];
