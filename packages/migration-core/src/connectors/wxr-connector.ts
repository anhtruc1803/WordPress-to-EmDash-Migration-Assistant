import { readFile } from "node:fs/promises";

import type { WordPressSourceBundle } from "@wp2emdash/shared-types";

import { parseWxr } from "../parsers/wxr-parser.js";

export async function loadWxrSource(path: string): Promise<WordPressSourceBundle> {
  const content = await readFile(path, "utf8");
  return parseWxr(content, path);
}

