export function detectShortcodes(content: string): string[] {
  const matches = [...content.matchAll(/\[(?!\/)([a-zA-Z0-9_-]+)(?=[\s\]\/])/g)];
  return matches.map((match) => match[1] ?? "").filter(Boolean);
}

