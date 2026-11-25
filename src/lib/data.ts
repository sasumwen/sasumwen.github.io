/**
 * Typed, validated access to the structured data in src/data/*.yaml.
 * A typo in a YAML file fails the build here with a readable message,
 * instead of silently producing a wrong page.
 */
import { z } from 'astro/zod';
import { SHOW_DRAFTS, type Status } from './drafts';

import profileRaw from '../data/profile.yaml';
import organisationsRaw from '../data/organisations.yaml';
import experienceRaw from '../data/experience.yaml';
import educationRaw from '../data/education.yaml';
import awardsRaw from '../data/awards.yaml';
import certificationsRaw from '../data/certifications.yaml';
import membershipsRaw from '../data/memberships.yaml';
import updatesRaw from '../data/updates.yaml';
import speakingRaw from '../data/speaking.yaml';
import nowRaw from '../data/now.yaml';
import researchResultsRaw from '../data/research-results.yaml';

/* ---------- shared ---------- */
const statusSchema = z.enum(['verified', 'self-reported', 'draft']);
const yearMonth = z.union([z.string(), z.number(), z.date()]).transform((v) => {
  if (v instanceof Date) return v.toISOString().slice(0, 7);
  return String(v);
});
const linkSchema = z.object({ label: z.string(), href: z.string() });

/* ---------- profile ---------- */
const profileSchema = z.object({
  name: z.object({
    full: z.string(),
    preferred: z.string(),
    first: z.string(),
    scholarly: z.string(),
    variants: z.array(z.string()).default([]),
    handle: z.string(),
    pronunciation: z.string().nullish(),
  }),
  headline: z.string(),
  headlineLong: z.string(),
  tagline: z.string(),
  location: z.object({ city: z.string(), region: z.string(), country: z.string(), display: z.string() }),
  origin: z.object({ city: z.string(), region: z.string(), country: z.string() }),
  positioning: z.string(),
  bios: z.record(z.string(), z.object({ status: statusSchema.default('verified'), text: z.string() })),
  proof: z.array(linkSchema),
  heroRoles: z
    .array(
      z.object({
        verb: z.string(),
        /** id of an entry in `current`; its title (with draft handling) is used unless `title` is given */
        roleRef: z.string().optional(),
        title: z.string().optional(),
        detail: z.string(),
        href: z.string(),
      }),
    )
    .default([]),
  heroMeta: z.array(z.string()).default([]),
  current: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      titleStatus: statusSchema.optional(),
      /** Wording every source agrees on; used in production while `titleStatus` is draft. */
      titleSafe: z.string().optional(),
      organisation: z.string(),
      since: yearMonth,
      summary: z.string(),
      href: z.string(),
      status: statusSchema.default('verified'),
    }),
  ),
  contact: z.object({
    email: z.object({ address: z.string(), status: statusSchema.default('verified') }),
    reasons: z.array(z.string()),
  }),
  identifiers: z.record(z.string(), z.string()),
  links: z.array(linkSchema.extend({ id: z.string() })),
  profiles: z.array(linkSchema),
  values: z
    .object({
      status: statusSchema.default('draft'),
      items: z.array(z.object({ lead: z.string(), text: z.string() })),
    })
    .optional(),
  knowsAbout: z.array(z.string()),
  languages: z.array(z.string()),
  interests: z.array(z.string()),
});
export type Profile = z.infer<typeof profileSchema>;
export const profile: Profile = profileSchema.parse(profileRaw);

/**
 * The title to print for a current role in this build: the proposed wording in preview
 * builds (with a badge rendered by the caller), the agreed wording in production.
 */
export function roleTitle(c: Profile['current'][number]): { title: string; draft: boolean } {
  const draft = c.titleStatus === 'draft';
  if (draft && !SHOW_DRAFTS) return { title: c.titleSafe ?? c.title, draft: false };
  return { title: c.title, draft };
}

/* ---------- organisations ---------- */
const organisationSchema = z.object({
  id: z.string(),
  name: z.string(),
  legalName: z.string().optional(),
  url: z.string().optional(),
  description: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  founded: z.union([z.string(), z.number()]).optional(),
  sameAs: z.array(z.string()).default([]),
  status: statusSchema.default('verified'),
});
export type Organisation = z.infer<typeof organisationSchema>;
export const organisations: Organisation[] = z.array(organisationSchema).parse(organisationsRaw);
const orgIndex = new Map(organisations.map((o) => [o.id, o]));
export function org(id: string): Organisation {
  const o = orgIndex.get(id);
  if (!o) throw new Error(`Unknown organisation id "${id}": add it to src/data/organisations.yaml`);
  return o;
}

/* ---------- experience ---------- */
export const roleKinds = ['leadership', 'engineering', 'research', 'policy', 'teaching', 'community'] as const;
const roleSchema = z.object({
  id: z.string(),
  organisation: z.string(),
  title: z.string(),
  /** Proposed wording still to be confirmed (shown with a badge in preview builds only). */
  titleProposed: z.string().optional(),
  kind: z.enum(roleKinds),
  start: yearMonth,
  end: yearMonth,
  location: z.string().optional(),
  status: statusSchema.default('verified'),
  summary: z.string(),
  bullets: z.array(z.string()).default([]),
  links: z.array(linkSchema).default([]),
  note: z.string().optional(),
  featured: z.boolean().default(false),
});
export type Role = z.infer<typeof roleSchema> & { titleIsProposed: boolean };
export const experienceAll: Role[] = z
  .array(roleSchema)
  .parse(experienceRaw)
  // In preview builds the proposed wording is printed (callers add the badge); production keeps the agreed title.
  .map((r) => (SHOW_DRAFTS && r.titleProposed ? { ...r, title: r.titleProposed, titleIsProposed: true } : { ...r, titleIsProposed: false }));
export const experience: Role[] = experienceAll.filter((r) => SHOW_DRAFTS || r.status !== 'draft');

/* ---------- education ---------- */
const educationSchema = z.object({
  id: z.string(),
  degree: z.string(),
  institution: z.string(),
  start: yearMonth,
  end: yearMonth,
  status: statusSchema.default('verified'),
  details: z.array(z.string()).default([]),
  gpa: z.object({ value: z.string(), status: statusSchema.default('self-reported') }).optional(),
  thesis: z.object({ title: z.string(), url: z.string(), page: z.string().optional() }).optional(),
  milestones: z
    .array(z.object({ label: z.string(), date: yearMonth, status: statusSchema.default('verified') }))
    .default([]),
});
export type Education = z.infer<typeof educationSchema>;
export const education: Education[] = z.array(educationSchema).parse(educationRaw);

/* ---------- awards ---------- */
const awardSchema = z.object({
  id: z.string(),
  title: z.string(),
  issuer: z.string(),
  date: yearMonth,
  endDate: yearMonth.optional(),
  kind: z.enum(['scholarship', 'award', 'fellowship', 'recognition', 'grant']),
  status: statusSchema.default('verified'),
  summary: z.string().optional(),
  amount: z.string().optional(),
  url: z.string().optional(),
  note: z.string().optional(),
  minor: z.boolean().default(false),
});
export type Award = z.infer<typeof awardSchema>;
export const awardsAll: Award[] = z.array(awardSchema).parse(awardsRaw);
export const awards: Award[] = awardsAll.filter((a) => SHOW_DRAFTS || a.status !== 'draft');

/* ---------- certifications ---------- */
const certificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  issuer: z.string(),
  issued: yearMonth,
  expires: yearMonth.optional(),
  url: z.string().optional(),
  status: statusSchema.default('verified'),
  note: z.string().optional(),
  featured: z.boolean().default(false),
});
export type Certification = z.infer<typeof certificationSchema>;
export const certifications: Certification[] = z
  .array(certificationSchema)
  .parse(certificationsRaw)
  .filter((c) => SHOW_DRAFTS || c.status !== 'draft');

/* ---------- memberships ---------- */
const membershipsSchema = z.object({
  professional: z.array(z.object({ name: z.string(), url: z.string().optional() })),
  volunteering: z.array(
    z.object({ name: z.string(), role: z.string().optional(), status: statusSchema.default('self-reported') }),
  ),
});
export const memberships = membershipsSchema.parse(membershipsRaw);

/* ---------- updates ---------- */
const updateSchema = z.object({
  id: z.string(),
  date: z.coerce.date(),
  kind: z.enum(['publication', 'talk', 'milestone', 'role', 'award', 'journal', 'press']),
  text: z.string(),
  href: z.string().optional(),
  status: statusSchema.default('verified'),
  dayUnknown: z.boolean().default(false),
});
export type Update = z.infer<typeof updateSchema>;
export const updates: Update[] = z
  .array(updateSchema)
  .parse(updatesRaw)
  .filter((u) => SHOW_DRAFTS || u.status !== 'draft')
  .sort((a, b) => b.date.getTime() - a.date.getTime());

/* ---------- speaking ---------- */
const speakingSchema = z.object({
  id: z.string(),
  date: yearMonth,
  event: z.string(),
  city: z.string().optional(),
  title: z.string(),
  role: z.enum(['speaker', 'presenter', 'panelist', 'showcase', 'participant', 'organiser']),
  status: statusSchema.default('verified'),
  summary: z.string().optional(),
  note: z.string().optional(),
  links: z.array(linkSchema).default([]),
});
export type Talk = z.infer<typeof speakingSchema>;
export const speaking: Talk[] = z
  .array(speakingSchema)
  .parse(speakingRaw)
  .filter((t) => SHOW_DRAFTS || t.status !== 'draft');

/* ---------- now ---------- */
const nowSchema = z.object({
  updated: z.coerce.date(),
  status: statusSchema.default('verified'),
  items: z.array(z.string()),
});
export const now = nowSchema.parse(nowRaw);

/* ---------- research results (transcribed from the deposited thesis) ---------- */
const researchResultsSchema = z.object({
  source: z.object({ label: z.string(), url: z.string() }),
  dataset: z.object({
    name: z.string(),
    longName: z.string(),
    subjects: z.number(),
    patients: z.number(),
    controls: z.number(),
    split: z.string(),
    ref: z.string(),
  }),
  headline: z.array(z.object({ value: z.string(), unit: z.string().optional(), label: z.string(), compare: z.string(), ref: z.string() })),
  segmentation: z.object({
    ref: z.string(),
    caption: z.string(),
    rows: z.array(
      z.object({
        model: z.string(),
        loss: z.string(),
        dice: z.number(),
        hd: z.number(),
        asd: z.number(),
        ours: z.boolean().default(false),
        best: z.boolean().default(false),
      }),
    ),
  }),
  perClass: z.object({ ref: z.string(), caption: z.string(), rows: z.array(z.object({ structure: z.string(), dice: z.number() })) }),
  classification: z.object({
    ref: z.string(),
    caption: z.string(),
    rows: z.array(
      z.object({
        model: z.string(),
        accuracy: z.number(),
        precision: z.number(),
        recall: z.number(),
        f1: z.number(),
        auc: z.number(),
        ours: z.boolean().default(false),
      }),
    ),
    tests: z.object({ ref: z.string(), note: z.string() }),
  }),
  limits: z.array(z.string()),
});
export type ResearchResults = z.infer<typeof researchResultsSchema>;
export const researchResults: ResearchResults = researchResultsSchema.parse(researchResultsRaw);

/* ---------- helpers ---------- */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-07" → "Jul 2026"; "present" → "Present"; "2025" → "2025". */
export function fmtYM(ym: string, opts: { long?: boolean } = {}): string {
  if (!ym) return '';
  if (ym === 'present') return 'Present';
  const [y, m] = ym.split('-');
  if (!m) return y;
  const idx = Number(m) - 1;
  const month = opts.long
    ? new Date(Date.UTC(2000, idx, 1)).toLocaleString('en-CA', { month: 'long', timeZone: 'UTC' })
    : MONTHS[idx];
  return `${month} ${y}`;
}

export function fmtDate(d: Date, opts: { month?: 'short' | 'long'; day?: boolean } = {}): string {
  return d.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: opts.month ?? 'short',
    ...(opts.day === false ? {} : { day: 'numeric' }),
    timeZone: 'UTC',
  });
}

export function fmtRange(start: string, end: string): string {
  const s = fmtYM(start);
  const e = fmtYM(end);
  return s === e ? s : `${s} – ${e}`;
}

export function yearOf(ym: string): number {
  return Number(ym.slice(0, 4));
}

export function isDraft(status?: Status): boolean {
  return status === 'draft';
}
