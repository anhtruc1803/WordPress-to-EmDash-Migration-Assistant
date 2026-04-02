import { InvalidArgumentError } from "commander";

export type CliSourceKind = "wxr" | "api";

export function parseSourceKind(value: string): CliSourceKind {
  if (value === "wxr" || value === "api") {
    return value;
  }

  throw new InvalidArgumentError('Source type must be "wxr" or "api".');
}

