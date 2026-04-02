import { stripHtml } from "../utils/html.js";

export interface GutenbergBlock {
  name: string;
  normalizedName: string;
  attrs: Record<string, unknown>;
  innerHTML: string;
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
    return {
      rawAttributes: value
    };
  }
}

export function parseGutenbergBlocks(content: string): GutenbergBlock[] {
  const blocks: GutenbergBlock[] = [];
  const openTagRegex = /<!--\s+wp:([A-Za-z0-9/_-]+)(?:\s+({[\s\S]*?}))?\s*(\/)?-->/g;
  let cursor = 0;

  while (true) {
    const match = openTagRegex.exec(content);
    if (!match) {
      break;
    }

    const [rawOpenTag, rawBlockName, rawAttributes, selfClosingMarker] = match;
    const blockName = rawBlockName ?? "html";
    const startIndex = match.index;

    const leadingChunk = content.slice(cursor, startIndex).trim();
    if (leadingChunk.length > 0) {
      blocks.push({
        name: "html",
        normalizedName: "core/html",
        attrs: {},
        innerHTML: leadingChunk,
        raw: leadingChunk,
        source: "classic"
      });
    }

    if (selfClosingMarker === "/") {
      blocks.push({
        name: blockName,
        normalizedName: normalizeBlockName(blockName),
        attrs: parseAttributes(rawAttributes),
        innerHTML: "",
        raw: rawOpenTag,
        source: "gutenberg"
      });
      cursor = openTagRegex.lastIndex;
      continue;
    }

    const closeTag = `<!-- /wp:${blockName} -->`;
    const closeIndex = content.indexOf(closeTag, openTagRegex.lastIndex);
    if (closeIndex === -1) {
      const trailing = content.slice(startIndex);
      blocks.push({
        name: blockName,
        normalizedName: normalizeBlockName(blockName),
        attrs: parseAttributes(rawAttributes),
        innerHTML: trailing.slice(rawOpenTag.length),
        raw: trailing,
        source: "gutenberg"
      });
      cursor = content.length;
      break;
    }

    const innerHTML = content.slice(openTagRegex.lastIndex, closeIndex);
    const raw = content.slice(startIndex, closeIndex + closeTag.length);
    blocks.push({
      name: blockName,
      normalizedName: normalizeBlockName(blockName),
      attrs: parseAttributes(rawAttributes),
      innerHTML,
      raw,
      source: "gutenberg"
    });

    cursor = closeIndex + closeTag.length;
    openTagRegex.lastIndex = cursor;
  }

  const trailingChunk = content.slice(cursor).trim();
  if (trailingChunk.length > 0) {
    blocks.push({
      name: "html",
      normalizedName: "core/html",
      attrs: {},
      innerHTML: trailingChunk,
      raw: trailingChunk,
      source: "classic"
    });
  }

  if (blocks.length === 0 && stripHtml(content).length > 0) {
    blocks.push({
      name: "html",
      normalizedName: "core/html",
      attrs: {},
      innerHTML: content,
      raw: content,
      source: "classic"
    });
  }

  return blocks;
}
