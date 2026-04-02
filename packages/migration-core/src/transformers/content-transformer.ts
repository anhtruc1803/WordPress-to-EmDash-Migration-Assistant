import type {
  StructuredNode,
  TransformResult,
  TransformWarning,
  TransformedDocument,
  WordPressContentItem,
  WordPressSourceBundle
} from "@wp2emdash/shared-types";

import { detectShortcodes } from "../auditors/shortcodes.js";
import { parseGutenbergBlocks, type GutenbergBlock } from "../parsers/gutenberg-parser.js";
import {
  extractAttribute,
  extractImageSources,
  extractListItems,
  extractTableRows,
  firstHeadingLevel,
  sanitizeText,
  stripHtml
} from "../utils/html.js";
import { createIssueId } from "../utils/ids.js";

function shortcodeNode(shortcode: string): StructuredNode {
  return {
    type: "shortcode-fallback",
    shortcode
  };
}

function unsupportedNode(block: GutenbergBlock, reason: string): StructuredNode {
  return {
    type: "unsupported-block",
    blockName: block.normalizedName,
    rawPayload: block.raw,
    reason
  };
}

function htmlFallbackNode(html: string, reason: string): StructuredNode {
  return {
    type: "html-fallback",
    html,
    reason
  };
}

function transformBlock(block: GutenbergBlock): { nodes: StructuredNode[]; assetReferences: string[]; warningReason?: string } {
  switch (block.normalizedName) {
    case "core/paragraph": {
      return {
        nodes: [{
          type: "paragraph",
          text: sanitizeText(block.innerHTML)
        }],
        assetReferences: []
      };
    }
    case "core/heading": {
      const level = typeof block.attrs.level === "number" ? block.attrs.level : firstHeadingLevel(block.innerHTML) ?? 2;
      return {
        nodes: [{
          type: "heading",
          level: Math.min(6, Math.max(1, Number(level))),
          text: sanitizeText(block.innerHTML)
        }],
        assetReferences: []
      };
    }
    case "core/list": {
      return {
        nodes: [{
          type: "list",
          ordered: /<ol/i.test(block.innerHTML) || block.attrs.ordered === true,
          items: extractListItems(block.innerHTML)
        }],
        assetReferences: []
      };
    }
    case "core/quote": {
      return {
        nodes: [{
          type: "quote",
          text: sanitizeText(block.innerHTML),
          citation: extractAttribute(block.innerHTML, "cite")
        }],
        assetReferences: []
      };
    }
    case "core/image": {
      const image = extractImageSources(block.innerHTML)[0];
      const url = typeof block.attrs.url === "string" ? block.attrs.url : image?.url;
      if (!url) {
        return {
          nodes: [htmlFallbackNode(block.raw, "Image block missing a resolvable URL")],
          assetReferences: [],
          warningReason: "Image block missing URL"
        };
      }

      return {
        nodes: [{
          type: "image",
          url,
          alt: typeof block.attrs.alt === "string" ? block.attrs.alt : image?.alt,
          caption: sanitizeText(block.innerHTML) || undefined
        }],
        assetReferences: [url]
      };
    }
    case "core/gallery": {
      const images = extractImageSources(block.innerHTML);
      return {
        nodes: [{
          type: "gallery",
          images
        }],
        assetReferences: images.map((image) => image.url)
      };
    }
    case "core/embed": {
      const url =
        (typeof block.attrs.url === "string" ? block.attrs.url : undefined) ??
        extractAttribute(block.innerHTML, "src") ??
        extractAttribute(block.innerHTML, "href");

      if (!url) {
        return {
          nodes: [htmlFallbackNode(block.raw, "Embed block missing a resolvable URL")],
          assetReferences: [],
          warningReason: "Embed block missing URL"
        };
      }

      return {
        nodes: [{
          type: "embed",
          url,
          provider: typeof block.attrs.providerNameSlug === "string" ? block.attrs.providerNameSlug : undefined
        }],
        assetReferences: [url]
      };
    }
    case "core/code": {
      return {
        nodes: [{
          type: "code",
          code: stripHtml(block.innerHTML)
        }],
        assetReferences: []
      };
    }
    case "core/separator": {
      return {
        nodes: [{
          type: "separator"
        }],
        assetReferences: []
      };
    }
    case "core/table": {
      return {
        nodes: [{
          type: "table",
          rows: extractTableRows(block.innerHTML)
        }],
        assetReferences: []
      };
    }
    case "core/html": {
      return {
        nodes: [htmlFallbackNode(block.innerHTML, "Raw HTML requires manual review")],
        assetReferences: [],
        warningReason: "Raw HTML requires manual review"
      };
    }
    default: {
      return {
        nodes: [unsupportedNode(block, "Custom block is not supported by the MVP transformer")],
        assetReferences: [],
        warningReason: `Unsupported block ${block.normalizedName}`
      };
    }
  }
}

function transformItem(item: WordPressContentItem): {
  document: TransformedDocument;
  warnings: TransformWarning[];
  unsupportedNodes: TransformResult["unsupportedNodes"];
  fallbackBlocks: TransformResult["fallbackBlocks"];
} {
  const warnings: TransformWarning[] = [];
  const unsupportedNodes: TransformResult["unsupportedNodes"] = [];
  const fallbackBlocks: TransformResult["fallbackBlocks"] = [];
  const blocks = parseGutenbergBlocks(item.content);
  const nodes: StructuredNode[] = [];
  const assetReferences = new Set<string>();

  blocks.forEach((block, index) => {
    const result = transformBlock(block);
    result.nodes.forEach((node) => {
      nodes.push(node);
      if (node.type === "unsupported-block" || node.type === "html-fallback") {
        unsupportedNodes.push({
          itemId: item.id,
          blockName: node.type === "unsupported-block" ? node.blockName : block.normalizedName,
          rawPayload: node.type === "unsupported-block" ? node.rawPayload : node.html
        });
      }

      if (node.type === "unsupported-block" || node.type === "html-fallback") {
        fallbackBlocks.push({
          itemId: item.id,
          type: node.type,
          payload: node.type === "unsupported-block" ? node.rawPayload : node.html
        });
      }
    });

    result.assetReferences.forEach((reference) => assetReferences.add(reference));

    if (result.warningReason) {
      warnings.push({
        id: createIssueId("transform-warning", item.id, index),
        itemId: item.id,
        severity: block.normalizedName === "core/html" ? "warning" : "error",
        message: result.warningReason,
        sourceType: block.normalizedName,
        rawValue: block.raw
      });
    }

    if (/<script[\s\S]*?>/i.test(block.innerHTML)) {
      warnings.push({
        id: createIssueId("transform-script", item.id, index),
        itemId: item.id,
        severity: "error",
        message: "Inline script fragments cannot be imported safely into EmDash content.",
        sourceType: block.normalizedName,
        rawValue: block.innerHTML
      });
    }
  });

  detectShortcodes(item.content).forEach((shortcode, index) => {
    nodes.push(shortcodeNode(shortcode));
    fallbackBlocks.push({
      itemId: item.id,
      type: "shortcode-fallback",
      payload: shortcode
    });
    warnings.push({
      id: createIssueId("shortcode-warning", item.id, index),
      itemId: item.id,
      severity: "warning",
      message: `Shortcode [${shortcode}] preserved as manual-fix fallback`,
      sourceType: "shortcode",
      rawValue: shortcode
    });
  });

  return {
    document: {
      itemId: item.id,
      title: item.title,
      slug: item.slug,
      postType: item.postType,
      nodes,
      assetReferences: [...assetReferences].sort(),
      sourceBlockNames: blocks.map((block) => block.normalizedName),
      unsupportedNodeCount: nodes.filter((node) => node.type === "unsupported-block" || node.type === "html-fallback").length,
      fallbackNodeCount: nodes.filter((node) => node.type === "unsupported-block" || node.type === "html-fallback" || node.type === "shortcode-fallback").length
    },
    warnings,
    unsupportedNodes,
    fallbackBlocks
  };
}

export function transformBundle(bundle: WordPressSourceBundle): TransformResult {
  const items = bundle.contentItems.map((item) => transformItem(item));
  const allAssetReferences = new Set<string>();

  items.forEach((result) => {
    result.document.assetReferences.forEach((reference) => allAssetReferences.add(reference));
  });

  return {
    items: items.map((result) => result.document),
    warnings: items.flatMap((result) => result.warnings),
    unsupportedNodes: items.flatMap((result) => result.unsupportedNodes),
    fallbackBlocks: items.flatMap((result) => result.fallbackBlocks),
    embeddedAssetReferences: [...allAssetReferences].sort()
  };
}
