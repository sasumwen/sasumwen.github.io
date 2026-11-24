import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * Content collections: long-form content lives in src/content/<collection>/.
 * Structured facts (roles, education, awards…) live in src/data/*.yaml and are
 * validated in src/lib/data.ts so that layouts never hard-code biography.
 *
 * `draft: true` keeps an entry out of production builds (see src/lib/drafts.ts).
 */

const status = z.enum(['verified', 'self-reported', 'draft']).default('verified');

const link = z.object({
  label: z.string(),
  href: z.string(),
  kind: z.enum(['site', 'doi', 'pdf', 'code', 'slides', 'video', 'press', 'event', 'other']).default('other'),
});

const metric = z.object({
  label: z.string(),
  value: z.string(),
  note: z.string().optional(),
  /** Metrics are only shown in production when approved. */
  approved: z.boolean().default(false),
  source: z.string().optional(),
});

const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      tagline: z.string(),
      organisation: z.string(),
      organisationId: z.string().optional(),
      role: z.string(),
      period: z.string(),
      status: z.enum(['live', 'in development', 'completed', 'ongoing']),
      location: z.string().optional(),
      kind: z.enum(['product', 'venture', 'policy', 'consulting', 'research', 'career']),
      sectors: z.array(z.string()).default([]),
      stack: z.array(z.string()).default([]),
      links: z.array(link).default([]),
      metrics: z.array(metric).default([]),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      /** photo: fills the case-study hero behind the title. inset: sits on the right and fades into the page, for images that must stay legible (a document, a portrait). */
      coverKind: z.enum(['photo', 'inset']).default('photo'),
      accent: z.enum(['amber', 'lagoon', 'ink']).default('amber'),
      featured: z.boolean().default(false),
      order: z.number().default(100),
      related: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      /** Which claims in this page still need the owner's or the organisation's approval. */
      approvals: z.array(z.string()).default([]),
      updated: z.coerce.date().optional(),
    }),
});

const publications = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/publications' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      shortTitle: z.string().optional(),
      type: z.enum(['conference', 'journal', 'thesis', 'preprint', 'note', 'talk']),
      authors: z.array(z.object({ name: z.string(), me: z.boolean().default(false), url: z.string().optional() })),
      venue: z.string(),
      venueShort: z.string().optional(),
      series: z.string().optional(),
      volume: z.string().optional(),
      pages: z.string().optional(),
      publisher: z.string().optional(),
      year: z.number(),
      published: z.coerce.date().optional(),
      doi: z.string().optional(),
      handle: z.string().optional(),
      isbn: z.array(z.string()).default([]),
      pdf: z.string().optional(),
      code: z.string().optional(),
      slides: z.string().optional(),
      poster: z.string().optional(),
      openAccess: z.boolean().default(false),
      pubStatus: z.enum(['published', 'accepted', 'in preparation', 'thesis contribution']).default('published'),
      abstract: z.string(),
      keywords: z.array(z.string()).default([]),
      bibtex: z.string().optional(),
      highlights: z.array(z.string()).default([]),
      cover: image().optional(),
      featured: z.boolean().default(false),
      order: z.number().default(100),
      draft: z.boolean().default(false),
      verification: status,
      note: z.string().optional(),
    }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      category: z.enum(['Research notes', 'Engineering', 'AI & society', 'Reflections']),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      canonical: z.url().optional(),
      external: z.object({ label: z.string(), href: z.url() }).optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

const journal = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/journal' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      dek: z.string(),
      date: z.coerce.date(),
      dateline: z.string(),
      place: z.string().optional(),
      cover: image(),
      coverAlt: z.string(),
      coverPosition: z.string().default('center'),
      gallery: z
        .array(
          z.object({
            src: image().optional(),
            alt: z.string(),
            caption: z.string().optional(),
            placeholder: z.string().optional(),
            span: z.enum(['1', '2', 'tall']).default('1'),
          }),
        )
        .default([]),
      /** Other people appear in photos: publication of the gallery is blocked until true. */
      peopleConsent: z.boolean().default(true),
      people: z.array(z.string()).default([]),
      tags: z.array(z.string()).default([]),
      related: z.array(z.string()).default([]),
      readingTime: z.number().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

export const collections = { work, publications, writing, journal };
