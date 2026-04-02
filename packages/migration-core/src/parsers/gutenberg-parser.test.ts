import { describe, expect, it } from "vitest";

import { parseGutenbergBlocks } from "./gutenberg-parser.js";

describe("parseGutenbergBlocks", () => {
  it("parses a simple paragraph block", () => {
    const content = `<!-- wp:paragraph --><p>Hello</p><!-- /wp:paragraph -->`;
    const blocks = parseGutenbergBlocks(content);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.normalizedName).toBe("core/paragraph");
    expect(blocks[0]?.innerHTML).toBe("<p>Hello</p>");
    expect(blocks[0]?.innerBlocks).toHaveLength(0);
  });

  it("parses a self-closing block", () => {
    const content = `<!-- wp:separator /-->`;
    const blocks = parseGutenbergBlocks(content);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.normalizedName).toBe("core/separator");
    expect(blocks[0]?.innerHTML).toBe("");
  });

  it("parses block attributes as JSON", () => {
    const content = `<!-- wp:heading {"level":3} --><h3>Title</h3><!-- /wp:heading -->`;
    const blocks = parseGutenbergBlocks(content);

    expect(blocks[0]?.attrs.level).toBe(3);
  });

  it("falls back to rawAttributes when attrs JSON is malformed", () => {
    const content = `<!-- wp:heading {bad json} --><h3>Title</h3><!-- /wp:heading -->`;
    const blocks = parseGutenbergBlocks(content);

    expect(blocks[0]?.attrs.rawAttributes).toBe("{bad json}");
  });

  it("handles nested blocks (columns > column > paragraph)", () => {
    const content = `
<!-- wp:columns -->
<div class="wp-block-columns">
  <!-- wp:column -->
  <div class="wp-block-column">
    <!-- wp:paragraph -->
    <p>Column content</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->
    `.trim();

    const blocks = parseGutenbergBlocks(content);

    // Top-level: just the columns block
    expect(blocks).toHaveLength(1);
    const columnsBlock = blocks[0]!;
    expect(columnsBlock.normalizedName).toBe("core/columns");

    // Direct children of columns: one column block
    expect(columnsBlock.innerBlocks).toHaveLength(1);
    const columnBlock = columnsBlock.innerBlocks[0]!;
    expect(columnBlock.normalizedName).toBe("core/column");

    // Children of column: one paragraph block
    expect(columnBlock.innerBlocks).toHaveLength(1);
    expect(columnBlock.innerBlocks[0]?.normalizedName).toBe("core/paragraph");
  });

  it("handles same-name nesting (nested columns inside columns)", () => {
    const content = `
<!-- wp:columns -->
<div>
  <!-- wp:columns -->
  <div>
    <!-- wp:paragraph --><p>Deep</p><!-- /wp:paragraph -->
  </div>
  <!-- /wp:columns -->
</div>
<!-- /wp:columns -->
    `.trim();

    const blocks = parseGutenbergBlocks(content);

    expect(blocks).toHaveLength(1);
    const outer = blocks[0]!;
    expect(outer.normalizedName).toBe("core/columns");

    expect(outer.innerBlocks).toHaveLength(1);
    const inner = outer.innerBlocks[0]!;
    expect(inner.normalizedName).toBe("core/columns");
    expect(inner.innerBlocks[0]?.normalizedName).toBe("core/paragraph");
  });

  it("captures classic HTML between blocks as core/html blocks", () => {
    const content = `<p>Classic before</p><!-- wp:paragraph --><p>Block</p><!-- /wp:paragraph --><p>Classic after</p>`;
    const blocks = parseGutenbergBlocks(content);

    expect(blocks).toHaveLength(3);
    expect(blocks[0]?.normalizedName).toBe("core/html");
    expect(blocks[1]?.normalizedName).toBe("core/paragraph");
    expect(blocks[2]?.normalizedName).toBe("core/html");
  });

  it("wraps pure classic content with no block comments as a single html block", () => {
    const content = `<p>Classic editor content</p>`;
    const blocks = parseGutenbergBlocks(content);

    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.normalizedName).toBe("core/html");
    expect(blocks[0]?.source).toBe("classic");
  });

  it("returns empty array for empty content", () => {
    expect(parseGutenbergBlocks("")).toHaveLength(0);
    expect(parseGutenbergBlocks("   ")).toHaveLength(0);
  });

  it("handles an unclosed block gracefully without throwing", () => {
    const content = `<!-- wp:paragraph --><p>No closing tag`;
    expect(() => parseGutenbergBlocks(content)).not.toThrow();

    const blocks = parseGutenbergBlocks(content);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.normalizedName).toBe("core/paragraph");
    // innerHTML should contain everything after the opening tag
    expect(blocks[0]?.innerHTML).toContain("No closing tag");
  });

  it("handles a self-closing image block inside a paragraph block", () => {
    const content = `
<!-- wp:paragraph -->
<p>Text before</p>
<!-- /wp:paragraph -->
<!-- wp:image {"id":42,"url":"https://example.com/img.jpg"} /-->
<!-- wp:paragraph -->
<p>Text after</p>
<!-- /wp:paragraph -->
    `.trim();

    const blocks = parseGutenbergBlocks(content);
    expect(blocks).toHaveLength(3);
    expect(blocks[1]?.normalizedName).toBe("core/image");
    expect(blocks[1]?.attrs.id).toBe(42);
  });

  it("normalises block names without namespace to core/ prefix", () => {
    const content = `<!-- wp:paragraph --><p>x</p><!-- /wp:paragraph -->`;
    // The name in the comment is just "paragraph" — should become "core/paragraph"
    const blocks = parseGutenbergBlocks(content);
    expect(blocks[0]?.normalizedName).toBe("core/paragraph");
    expect(blocks[0]?.name).toBe("paragraph");
  });

  it("preserves third-party namespaced block names", () => {
    const content = `<!-- wp:acf/hero {"name":"acf/hero"} --><div>ACF</div><!-- /wp:acf/hero -->`;
    const blocks = parseGutenbergBlocks(content);
    expect(blocks[0]?.normalizedName).toBe("acf/hero");
  });
});
