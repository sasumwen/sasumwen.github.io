import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { profile, updates } from '../lib/data';
import { notDraft } from '../lib/drafts';

export async function GET(context: APIContext) {
  const site = context.site ?? new URL('https://osasumwen.com');
  const writing = (await getCollection('writing', notDraft)).map((p) => ({
    title: p.data.title,
    description: p.data.description,
    pubDate: p.data.date,
    link: `/writing/${p.id}/`,
    categories: ['Writing', p.data.category],
  }));
  const journal = (await getCollection('journal', notDraft)).map((j) => ({
    title: j.data.title,
    description: j.data.dek,
    pubDate: j.data.date,
    link: `/journal/${j.id}/`,
    categories: ['Journal', ...j.data.tags],
  }));
  const news = updates.slice(0, 20).map((u) => ({
    title: u.text.length > 90 ? u.text.slice(0, 88) + '…' : u.text,
    description: u.text,
    pubDate: u.date,
    link: u.href ?? '/updates/',
    categories: ['Updates', u.kind],
  }));
  const items = [...writing, ...journal, ...news].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: `${profile.name.preferred}: writing, journal and updates`,
    description: profile.positioning,
    site,
    items,
    customData: `<language>en-ca</language><managingEditor>${profile.contact.email.address} (${profile.name.preferred})</managingEditor>`,
    stylesheet: false,
  });
}
