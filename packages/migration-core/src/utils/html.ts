const namedEntities: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": "\"",
  "&#39;": "'",
  "&nbsp;": " "
};

export function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(Number.parseInt(code, 16)))
    .replace(/&(amp|lt|gt|quot|nbsp);|&#39;/g, (entity) => namedEntities[entity] ?? entity);
}

export function stripHtml(value: string): string {
  return decodeHtmlEntities(
    value
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|blockquote|h[1-6]|tr)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function extractAttribute(markup: string, attribute: string): string | undefined {
  const match = markup.match(new RegExp(`${attribute}=["']([^"']+)["']`, "i"));
  return match?.[1];
}

export function extractImageSources(markup: string): Array<{ url: string; alt?: string }> {
  const matches = [...markup.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];

  return matches.map((match) => {
    const html = match[0];
    const alt = extractAttribute(html, "alt");
    return {
      url: match[1] ?? "",
      ...(alt ? { alt } : {})
    };
  }).filter((image) => image.url.length > 0);
}

export function extractListItems(markup: string): string[] {
  return [...markup.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => stripHtml(match[1] ?? ""))
    .filter(Boolean);
}

export function extractTableRows(markup: string): string[][] {
  return [...markup.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((rowMatch) => {
    return [...(rowMatch[1] ?? "").matchAll(/<(td|th)[^>]*>([\s\S]*?)<\/(td|th)>/gi)]
      .map((cellMatch) => stripHtml(cellMatch[2] ?? ""));
  }).filter((row) => row.length > 0);
}

export function firstHeadingLevel(markup: string): number | undefined {
  const match = markup.match(/<h([1-6])[^>]*>/i);
  return match?.[1] ? Number(match[1]) : undefined;
}

export function sanitizeText(value: string): string {
  return stripHtml(value).replace(/\s{2,}/g, " ").trim();
}
