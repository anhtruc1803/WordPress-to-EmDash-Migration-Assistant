import { describe, expect, it } from "vitest";

import { detectShortcodes } from "./shortcodes.js";

describe("detectShortcodes", () => {
  it("finds shortcode signatures in content", () => {
    const result = detectShortcodes('<p>Intro [gallery ids="1,2"] and [contact-form-7 id="22"] outro.</p>');
    expect(result).toEqual(["gallery", "contact-form-7"]);
  });
});

