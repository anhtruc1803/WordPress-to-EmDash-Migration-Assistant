import { stripHtml } from "../utils/html.js";

export interface GutenbergBlock {
  name: string;
  normalizedName: string;
  attrs: Record<string, unknown>;
  innerHTML: string;
  innerBlocks: GutenbergBlock[];
  raw: string;
  source: "gutenberg" | "classic";
}

function normalizeBlockName(name: string): string {
  return name.includes("/") ? name : `core/${name}`;
}

function parseAttributes(value: string | undefined): Record<string, unknown> {
  if (!value) {
    return {};
  }

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return { rawAttributes: value };
  }
}

// Matches an opening block comment: <!-- wp:name {"key":"val"} --> or <!-- wp:name /-->
const OPEN_TAG_RE = /<!--\s+wp:([A-Za-z0-9/_-]+)(?:\s+({[\s\S]*?}))?\s*(\/)?-->/g;
// Matches a closing block comment for a given block name
function closingTagFor(name: string): RegExp {
  return new RegExp(`<!--\\s+\\/wp:${name.replace("/", "\\/")}\\s+-->`, "g");
}

/**
 * Recursive descent Gutenberg block parser.
 *
 * Unlike the previous regex-only approach this implementation properly handles
 * nested blocks (Columns, Group, Cover, etc.) by recursing into each block's
 * innerHTML before returning it to the caller.
 *
 * Algorithm:
 *   1. Scan forward with OPEN_TAG_RE for the next block opening comment.
 *   2. If self-closing: emit the block immediately and continue.
 *   3. Otherwise: find the *matching* closing comment by counting open/close
 *      pairs for the same block name (handles same-name nesting).
 *   4. Recursively parse the extracted innerHTML to collect innerBlocks.
 *   5. Any text between two block comments becomes a classic "html" block.
 */
export function parseGutenbergBlocks(content: string): GutenbergBlock[] {
  return parseBlocksInRange(content, 0, content.length);
}

function parseBlocksInRange(content: string, start: number, end: number): GutenbergBlock[] {
  const blocks: GutenbergBlock[] = [];
  const openTagRegex = new RegExp(OPEN_TAG_RE.source, "g");
  let cursor = start;

  while (true) {
    openTagRegex.lastIndex = cursor;
    const match = openTagRegex.exec(content);

    // No more block comments in range — treat remainder as classic HTML
    if (!match || match.index >= end) {
      break;
    }

    const [rawOpenTag, rawBlockName, rawAttributes, selfClosingMarker] = match;
    const blockName = rawBlockName ?? "html";
    const blockStart = match.index;

    // Emit any leading classic HTML fragment
    const leadingChunk = content.slice(cursor, blockStart).trim();
    if (leadingChunk.length > 0) {
      blocks.push(makeClassicBlock(leadingChunk));
    }

    if (selfClosingMarker === "/") {
      // Self-closing block: no innerHTML, no inner blocks
      blocks.push({
        name: blockName,
        normalizedName: normalizeBlockName(blockName),
        attrs: parseAttributes(rawAttributes),
        innerHTML: "",
        innerBlocks: [],
        raw: rawOpenTag,
        source: "gutenberg"
      });
      cursor = match.index + rawOpenTag.length;
      continue;
    }

    // Find the matching closing tag, accounting for same-name nesting
    const afterOpen = match.index + rawOpenTag.length;
    const closeResult = findMatchingClose(content, blockName, afterOpen, end);

    if (!closeResult) {
      // Unclosed block — consume to end of range, emit with warning marker
      const raw = content.slice(blockStart, end);
      const innerHTML = content.slice(afterOpen, end);
      blocks.push({
        name: blockName,
        normalizedName: normalizeBlockName(blockName),
        attrs: parseAttributes(rawAttributes),
        innerHTML,
        // Only include real Gutenberg blocks as innerBlocks — filter out HTML wrapper fragments
        innerBlocks: parseBlocksInRange(content, afterOpen, end).filter((b) => b.source === "gutenberg"),
        raw,
        source: "gutenberg"
      });
      cursor = end;
      break;
    }

    const { closeStart, closeEnd } = closeResult;
    const innerHTML = content.slice(afterOpen, closeStart);
    const raw = content.slice(blockStart, closeEnd);

    blocks.push({
      name: blockName,
      normalizedName: normalizeBlockName(blockName),
      attrs: parseAttributes(rawAttributes),
      innerHTML,
      // Only include real Gutenberg blocks as innerBlocks — filter out HTML wrapper fragments.
      // Classic HTML between block comments is structural markup (e.g. <div class="wp-block-columns">),
      // not a real inner block, and must not be double-counted by the transformer.
      innerBlocks: parseBlocksInRange(content, afterOpen, closeStart).filter((b) => b.source === "gutenberg"),
      raw,
      source: "gutenberg"
    });

    cursor = closeEnd;
  }

  // Trailing classic HTML fragment
  const trailingChunk = content.slice(cursor, end).trim();
  if (trailingChunk.length > 0) {
    blocks.push(makeClassicBlock(trailingChunk));
  }

  // If we produced nothing but there is meaningful text, wrap as classic
  if (blocks.length === 0 && stripHtml(content.slice(start, end)).length > 0) {
    blocks.push(makeClassicBlock(content.slice(start, end)));
  }

  return blocks;
}

/**
 * Find the closing comment that matches the opening for `blockName` starting
 * at `searchFrom`, respecting same-name nesting depth.
 *
 * Returns { closeStart, closeEnd } of the closing tag, or null if not found.
 */
function findMatchingClose(
  content: string,
  blockName: string,
  searchFrom: number,
  limit: number
): { closeStart: number; closeEnd: number } | null {
  const openRe = new RegExp(`<!--\\s+wp:${blockName.replace("/", "\\/")}(?:\\s+[\\s\\S]*?)?\\s*(?:\\/)?-->`, "g");
  const closeRe = closingTagFor(blockName);

  let depth = 1;
  let pos = searchFrom;

  while (depth > 0 && pos < limit) {
    openRe.lastIndex = pos;
    closeRe.lastIndex = pos;

    const nextOpen = openRe.exec(content);
    const nextClose = closeRe.exec(content);

    if (!nextClose || nextClose.index >= limit) {
      // No closing tag found within bounds
      return null;
    }

    if (nextOpen && nextOpen.index < nextClose.index) {
      // Found another opening before the next close — descend one level
      depth += 1;
      pos = nextOpen.index + nextOpen[0].length;
    } else {
      // Found a closing tag
      depth -= 1;
      if (depth === 0) {
        return {
          closeStart: nextClose.index,
          closeEnd: nextClose.index + nextClose[0].length
        };
      }
      pos = nextClose.index + nextClose[0].length;
    }
  }

  return null;
}

function makeClassicBlock(html: string): GutenbergBlock {
  return {
    name: "html",
    normalizedName: "core/html",
    attrs: {},
    innerHTML: html,
    innerBlocks: [],
    raw: html,
    source: "classic"
  };
}
