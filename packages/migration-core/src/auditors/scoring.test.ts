import { describe, expect, it } from "vitest";

import { scoreDifficulty } from "./scoring.js";

describe("scoreDifficulty", () => {
  it("scores risky migrations as high difficulty", () => {
    const result = scoreDifficulty({
      unsupportedBlockOccurrences: 4,
      uniqueUnsupportedBlocks: 2,
      shortcodeOccurrences: 3,
      builderHints: [{
        name: "Elementor",
        confidence: 0.95,
        matchedSignals: ["/elementor/i"]
      }],
      pluginHints: [],
      customPostTypeCount: 2,
      findings: [{
        id: "f1",
        severity: "error",
        title: "Script fragment detected",
        detail: "Inline script",
        category: "script"
      }]
    });

    expect(result.difficulty).toBe("High");
    expect(result.recommendation).toBe("rebuild-recommended");
  });
});

