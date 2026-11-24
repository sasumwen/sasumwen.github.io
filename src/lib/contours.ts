/**
 * Contour lines: the one graphic signature of the site.
 *
 * Deterministic (seeded) SVG path generators, run at build time only.
 * Two families:
 *  - rings():  nested, organically distorted loops: the edge map of a structure
 *              (think: a subcortical region in an MRI slice, or a hill on a map)
 *  - ridges(): open lines flowing across a width: section dividers, backdrops
 */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed: number | string): number {
  if (typeof seed === 'number') return seed;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type Pt = [number, number];

/** Catmull-Rom → cubic Bézier path (closed or open), rounded to 1 dp. */
function smoothPath(points: Pt[], closed: boolean): string {
  const n = points.length;
  if (n < 2) return '';
  const p = (i: number): Pt => (closed ? points[((i % n) + n) % n]! : points[Math.max(0, Math.min(n - 1, i))]!);
  // integers are plenty at these sizes (viewBox units ≈ CSS px); keeps inline SVG small
  const f = (v: number) => Math.round(v);
  let d = `M${f(points[0]![0])} ${f(points[0]![1])}`;
  const count = closed ? n : n - 1;
  for (let i = 0; i < count; i++) {
    const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2);
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return closed ? d + ' Z' : d;
}

export interface RingsOptions {
  seed?: number | string;
  cx?: number;
  cy?: number;
  rings?: number;
  rMin?: number;
  rMax?: number;
  /** 0–1: how far each ring departs from a circle */
  wobble?: number;
  /** points per ring */
  segments?: number;
  /** horizontal stretch */
  aspect?: number;
}

export function rings(opts: RingsOptions = {}): string[] {
  const { seed = 7, cx = 300, cy = 300, rings = 9, rMin = 40, rMax = 280, wobble = 0.22, segments = 30, aspect = 1.1 } = opts;
  const rnd = mulberry32(hashSeed(seed));
  // Shared low-frequency "shape" harmonics so rings nest like real contours.
  const harmonics = Array.from({ length: 4 }, (_, k) => ({
    freq: k + 2,
    amp: (rnd() * 0.6 + 0.4) / (k + 1),
    phase: rnd() * Math.PI * 2,
  }));
  const paths: string[] = [];
  for (let i = 0; i < rings; i++) {
    const t = rings === 1 ? 0 : i / (rings - 1);
    const r = rMin + (rMax - rMin) * Math.pow(t, 1.15);
    const localJitter = 0.08 * wobble;
    const pts: Pt[] = [];
    for (let s = 0; s < segments; s++) {
      const a = (s / segments) * Math.PI * 2;
      let m = 1;
      for (const h of harmonics) m += wobble * h.amp * Math.sin(h.freq * a + h.phase + t * 0.9);
      m += (rnd() - 0.5) * localJitter;
      pts.push([cx + Math.cos(a) * r * m * aspect, cy + Math.sin(a) * r * m]);
    }
    paths.push(smoothPath(pts, true));
  }
  return paths;
}

export interface RidgesOptions {
  seed?: number | string;
  width?: number;
  height?: number;
  lines?: number;
  /** vertical amplitude as a fraction of height */
  amplitude?: number;
  segments?: number;
  /** spread lines across the full height (true) or cluster them mid-way */
  spread?: number;
}

export function ridges(opts: RidgesOptions = {}): string[] {
  const { seed = 11, width = 1200, height = 400, lines = 8, amplitude = 0.22, segments = 14, spread = 0.9 } = opts;
  const rnd = mulberry32(hashSeed(seed));
  const harmonics = Array.from({ length: 3 }, (_, k) => ({
    freq: (k + 1) * (0.9 + rnd() * 0.5),
    amp: (rnd() * 0.5 + 0.5) / (k + 1),
    phase: rnd() * Math.PI * 2,
  }));
  const paths: string[] = [];
  for (let i = 0; i < lines; i++) {
    const t = lines === 1 ? 0.5 : i / (lines - 1);
    const baseY = height * (0.5 + (t - 0.5) * spread);
    const pts: Pt[] = [];
    for (let s = 0; s <= segments; s++) {
      const x = (s / segments) * width;
      const u = (s / segments) * Math.PI * 2;
      let y = 0;
      for (const h of harmonics) y += h.amp * Math.sin(h.freq * u + h.phase + t * 1.6);
      // lines converge towards the right: a ridge "pinching" in
      const pinch = 1 - 0.35 * (s / segments);
      pts.push([x, baseY + y * amplitude * height * pinch]);
    }
    paths.push(smoothPath(pts, false));
  }
  return paths;
}
