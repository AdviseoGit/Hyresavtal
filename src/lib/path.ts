/** Läs och skriv nästlade fält via punktnotation, t.ex. "tenants.0.name". */

export function getPath<T = unknown>(source: unknown, path: string): T | undefined {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, source) as T | undefined;
}

/** Returnerar en kopia med värdet satt — muterar aldrig indata. */
export function setPath<T>(source: T, path: string, value: unknown): T {
  const [key, ...rest] = path.split(".");
  if (Array.isArray(source)) {
    const index = Number(key);
    const copy = source.slice();
    copy[index] = rest.length ? setPath(copy[index], rest.join("."), value) : value;
    return copy as unknown as T;
  }
  const obj = { ...(source as Record<string, unknown>) };
  obj[key] = rest.length ? setPath(obj[key], rest.join("."), value) : value;
  return obj as T;
}
