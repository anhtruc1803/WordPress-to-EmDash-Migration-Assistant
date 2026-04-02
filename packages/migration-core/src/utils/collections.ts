export function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export function incrementCount(map: Map<string, number>, key: string, delta = 1): void {
  map.set(key, (map.get(key) ?? 0) + delta);
}

export function mapToSortedArray<T>(
  map: Map<string, T>,
  mapper: (key: string, value: T) => T
): T[] {
  return [...map.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([key, value]) => mapper(key, value));
}

