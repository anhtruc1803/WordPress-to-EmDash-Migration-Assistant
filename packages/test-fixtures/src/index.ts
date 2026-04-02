import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

async function readFixture(pathSegments: string[]): Promise<string> {
  return readFile(resolve(root, ...pathSegments), "utf8");
}

export function fixturePath(...pathSegments: string[]): string {
  return resolve(root, ...pathSegments);
}

export async function loadWxrFixture(name = "sample-site.xml"): Promise<string> {
  return readFixture(["wxr", name]);
}

export async function loadRestFixture(name: string): Promise<string> {
  return readFixture(["rest", name]);
}
