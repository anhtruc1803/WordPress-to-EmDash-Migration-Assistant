import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export async function ensureDirectory(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}

export async function writeJsonFile(path: string, value: unknown): Promise<void> {
  await ensureDirectory(dirname(path));
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function writeTextFile(path: string, value: string): Promise<void> {
  await ensureDirectory(dirname(path));
  await writeFile(path, value, "utf8");
}

export async function readJsonFile<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

