import { describe, expect, it } from "vitest";

import { detectShortcodes } from "./shortcodes.js";

describe("detectShortcodes", () => {
  it("finds shortcode signatures in content and returns name + raw", () => {
    const result = detectShortcodes('<p>Intro [gallery ids="1,2"] and [contact-form-7 id="22"] outro.</p>');
    expect(result).toHaveLength(2);
    expect(result[0]?.name).toBe("gallery");
    expect(result[0]?.raw).toBe('[gallery ids="1,2"]');
    expect(result[1]?.name).toBe("contact-form-7");
    expect(result[1]?.raw).toBe('[contact-form-7 id="22"]');
  });

  it("de-duplicates shortcodes by name and keeps first occurrence", () => {
    const result = detectShortcodes('[gallery ids="1"] [gallery ids="2"]');
    expect(result).toHaveLength(1);
    expect(result[0]?.raw).toBe('[gallery ids="1"]');
  });

  it("returns empty array when no shortcodes present", () => {
    expect(detectShortcodes("<p>Plain content</p>")).toHaveLength(0);
  });
});

