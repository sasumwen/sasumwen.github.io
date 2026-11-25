import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { profile, education, org, fmtYM, roleTitle } from '../lib/data';
import { notDraft } from '../lib/drafts';

/**
 * /llms.txt: a Markdown summary for AI crawlers and assistants (llmstxt.org convention).
 * Built from the same data files as the pages, so it never drifts from the site.
 */
export async function GET(context: APIContext) {
  const site = (context.site ?? new URL('https://osasumwen.com')).href.replace(/\/$/, '');
  const pubs = (await getCollection('publications', notDraft)).filter((p) => p.data.verification !== 'draft').sort((a, b) => a.data.order - b.data.order);
  const work = (await getCollection('work', notDraft)).sort((a, b) => a.data.order - b.data.order);
  const writing = (await getCollection('writing', notDraft)).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  const journal = (await getCollection('journal', notDraft)).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const roles = profile.current.map((c) => `- ${roleTitle(c).title}, ${org(c.organisation).name} (since ${fmtYM(String(c.since))}): ${c.summary}`).join('\n');
  const edu = education.map((e) => `- ${e.degree}, ${org(e.institution).name} (${fmtYM(e.start)} – ${fmtYM(e.end)})${e.thesis ? `. Thesis: "${e.thesis.title}" ${e.thesis.url}` : ''}`).join('\n');
  const pubLines = pubs.map((p) => `- [${p.data.title}](${site}/research/${p.id}/): ${p.data.venue}${p.data.doi ? `. https://doi.org/${p.data.doi}` : p.data.handle ? `. ${p.data.handle}` : ''}`).join('\n');
  const workLines = work.map((w) => `- [${w.data.title}](${site}/work/${w.id}/): ${w.data.tagline}`).join('\n');
  const writingLines = writing.map((w) => `- [${w.data.title}](${site}/writing/${w.id}/): ${w.data.description}`).join('\n');
  const journalLines = journal.map((j) => `- [${j.data.title}](${site}/journal/${j.id}/): ${j.data.dek}`).join('\n');

  const body = `# ${profile.name.full} (${profile.name.preferred})

> ${profile.positioning}

Canonical site: ${site}/ · Based in ${profile.location.display}. ORCID ${profile.identifiers.orcid}.
Preferred short name: ${profile.name.preferred}. Scholarly name: ${profile.name.scholarly}. Call sign: ${profile.name.handle}.

## Current roles
${roles}

## Education
${edu}

## Publications
${pubLines}

## Work and case studies
${workLines}

## Writing
${writingLines || '- (first articles in preparation)'}

## Journal
${journalLines || '- (stories in preparation)'}

## Profiles (same person)
${profile.links.map((l) => `- ${l.label}: ${l.href}`).join('\n')}
${profile.profiles.map((p) => `- ${p.label}: ${p.href}`).join('\n')}

## Key pages
- About (biography, facts, bio kit): ${site}/about/
- Resume: ${site}/resume/ (PDF: ${site}/resume.pdf)
- Contact: ${site}/contact/
- Updates (dated news): ${site}/updates/ · RSS: ${site}/rss.xml
- Sitemap: ${site}/sitemap-index.xml
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
