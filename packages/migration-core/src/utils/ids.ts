export function createIssueId(prefix: string, itemId: string, index: number): string {
  return `${prefix}:${itemId}:${index}`;
}

