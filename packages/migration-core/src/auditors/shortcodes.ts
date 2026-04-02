export interface DetectedShortcode {
  /** Shortcode name only, e.g. "gallery" */
  name: string;
  /** Full raw shortcode tag including all attributes, e.g. `[gallery ids="1,2,3" columns="3"]` */
  raw: string;
}

/**
 * Detect WordPress shortcodes in content.
 *
 * Captures the full opening tag (including attributes) so that downstream
 * shortcode-fallback nodes preserve enough context for manual recovery.
 *
 * Pattern breakdown:
 *   \[           — opening bracket
 *   (?!\/)       — negative lookahead: not a closing tag [/shortcode]
 *   ([a-zA-Z0-9_-]+)  — shortcode name (capture group 1)
 *   ([^\]]*?)    — optional attributes, non-greedy (capture group 2)
 *   \/?          — optional self-close marker
 *   \]           — closing bracket of the opening tag
 */
export function detectShortcodes(content: string): DetectedShortcode[] {
  const pattern = /\[(?!\/)([a-zA-Z0-9_-]+)([^\]]*?)\/?]/g;
  const seen = new Map<string, DetectedShortcode>();

  for (const match of content.matchAll(pattern)) {
    const name = match[1] ?? "";
    if (!name) continue;
    // De-duplicate by name — keep the first occurrence as the representative raw value
    if (!seen.has(name)) {
      seen.set(name, { name, raw: match[0] });
    }
  }

  return [...seen.values()];
}
