export function readingTime(text: string, wpm = 220): number {
  const words = text.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wpm));
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function absoluteUrl(path: string, site = 'https://osasumwen.com'): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${site}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function truncate(s: string, n = 155): string {
  if (s.length <= n) return s;
  const cut = s.slice(0, n - 1);
  return cut.slice(0, cut.lastIndexOf(' ')) + '…';
}

/** Group an array by a key function, preserving first-seen key order. */
export function groupBy<T, K extends string | number>(items: T[], key: (t: T) => K): [K, T[]][] {
  const map = new Map<K, T[]>();
  for (const it of items) {
    const k = key(it);
    const arr = map.get(k);
    if (arr) arr.push(it);
    else map.set(k, [it]);
  }
  return [...map.entries()];
}
