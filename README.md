# osasumwen.com

Personal website of **Osasu Imarhiagbe** — AI engineer, researcher and founder. Built with [Astro](https://astro.build) as a fully static site; the design system is called *Boundary*.

> **Status:** live at [osasumwen.com](https://osasumwen.com). Every push to `master` is built and deployed by GitHub Actions.

## Run it locally

```bash
npm install          # Node 22.12+ (see package.json → engines)
npm run dev          # http://localhost:4321 — drafts and placeholders are visible with badges
npm run build        # production build into dist/ (drafts hidden)
npm run preview      # serve dist/ locally
npm run verify       # type-check + build + internal link check (what CI runs)
```

To build a *preview* that shows draft content with badges (what you see in `npm run dev`):

```bash
npm run build:preview && npm run preview      # PUBLIC_SHOW_DRAFTS=true astro build
```

`npm run build:portable` makes a copy in `dist-portable/` that opens from any folder or sub-path (file-per-page output, root-relative URLs rewritten by `scripts/relativize.mjs`); it exists only for sharing previews and is never deployed.

## Where things live

| Path | What it is | Edit when… |
|---|---|---|
| `src/data/profile.yaml` | Name, headline, positioning, bios, proof chips, current roles, contact, identifiers, `sameAs` links | your title, location, e-mail or headline changes |
| `src/data/experience.yaml` | Every role (drives the Work timeline, the resume and JSON-LD) | you start or finish a role |
| `src/data/education.yaml`, `awards.yaml`, `certifications.yaml`, `memberships.yaml` | Credentials and affiliations | new award, certificate, membership |
| `src/data/updates.yaml` | Dated news items (Home → Lately, `/updates/`, RSS) | anything worth announcing |
| `src/data/speaking.yaml` | Talks, panels, showcases | you speak somewhere |
| `src/data/now.yaml` | The `/now/` page | quarterly |
| `src/data/organisations.yaml` | Organisations referenced by id (names, URLs) | a new employer/partner appears |
| `src/content/work/*.mdx` | Case studies | a project deserves a page |
| `src/content/publications/*.mdx` | Papers, thesis, research notes (with BibTeX) | a paper is accepted/published |
| `src/content/writing/*.mdx` | Articles | you write something |
| `src/content/journal/*.mdx` | Photo essays | a story is ready |
| `src/assets/photos/` | Processed photographs (EXIF-stripped, ≤ 2400 px). Masters stay **out** of the repo. | new photos |
| `src/data/research-results.yaml` | The measured thesis results, each with the thesis table it comes from | never, unless the thesis is corrected |
| `public/` | Files copied verbatim: `CNAME`, `resume.pdf`, `robots.txt`, favicons, default OG image | see below for the resume PDF |

`public/resume.pdf` is printed from the `/resume/` page, so it never disagrees with the site. After changing resume facts: `npm run build && npm run resume:pdf` (uses the Chrome or Chromium already installed; refuses to run on a preview build, so draft items cannot be printed).

All YAML is validated at build time (`src/lib/data.ts`); content front-matter is validated by `src/content.config.ts`. A typo fails the build with a readable message instead of producing a wrong page.

### Draft and approval flags

- Front-matter `draft: true` (content) or `status: draft` (data) → shown **with an amber badge** in `npm run dev` and in preview builds, **hidden** in production builds.
- Inline `<Draft q="Q6">…</Draft>` marks a sentence that awaits confirmation; it renders only in preview builds.
- Case-study `metrics[].approved: false` and journal `peopleConsent: false` hold back numbers and galleries until approved.
- The question ids (`Q6`, `D1`, `M4`…) refer to the planning notes, which are kept outside this repository.

## Design system in brief

Tokens live in `src/styles/tokens.css` (light + dark). Type: Fraunces (display), Instrument Sans (text), IBM Plex Mono (metadata), self-hosted via `@fontsource`. The contour-line motif is generated at build time by `src/lib/contours.ts` and rendered by `src/components/Contours.astro`. Motion is CSS-only, honours `prefers-reduced-motion`, and the whole runtime script is `src/scripts/site.ts` (theme, reveals, menu, copy buttons, timeline filters, lightbox).

## Discoverability

Every page emits a JSON-LD graph (`Person`, `WebSite`, page-specific nodes, breadcrumbs) from the same data files; `/llms.txt`, `/rss.xml` (and the legacy `/feed.xml`), `/sitemap-index.xml` and `robots.txt` are generated. Old URLs (`/osasu1.pdf`, `/osasu.pdf`) redirect to `/resume.pdf`.

## Deployment

`.github/workflows/ci.yml` builds and checks every push to a branch other than `master`. `.github/workflows/deploy.yml` runs on every push to `master`: it type-checks, builds, checks internal links and publishes `dist/` to GitHub Pages (Pages source: *GitHub Actions*). A failed check stops the deploy and the previous version stays live.

Drafts never reach production: the deploy workflow does not set `PUBLIC_SHOW_DRAFTS`.

## Not in this repository

Photo masters, planning notes and unapproved drafts live in local folders that git ignores (`private/`, `docs/`, `revamp/`). Only processed, metadata-free photographs are committed.
