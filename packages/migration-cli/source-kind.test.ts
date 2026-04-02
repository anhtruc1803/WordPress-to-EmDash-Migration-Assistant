import { describe, expect, it } from "vitest";

import { parseSourceKind } from "./src/source-kind.js";

describe("parseSourceKind", () => {
  it("accepts supported source kinds", () => {
    expect(parseSourceKind("wxr")).toBe("wxr");
    expect(parseSourceKind("api")).toBe("api");
  });

  it("rejects invalid source kinds with a clear error", () => {
    expect(() => parseSourceKind("banana")).toThrow('Source type must be "wxr" or "api".');
  });
});
