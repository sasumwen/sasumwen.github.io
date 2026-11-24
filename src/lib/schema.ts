/**
 * JSON-LD builders. One Person node is reused everywhere by @id so that
 * search engines and AI assistants see a single consistent entity.
 */
import { profile, organisations, education, org, roleTitle } from './data';

export const SITE = 'https://osasumwen.com';
export const PERSON_ID = `${SITE}/#person`;
export const WEBSITE_ID = `${SITE}/#website`;

type Node = Record<string, unknown>;

export function personNode(opts: { image?: string } = {}): Node {
  const alumni = education.map((e) => ({ '@type': 'CollegeOrUniversity', name: org(e.institution).name, url: org(e.institution).url }));
  const worksFor = profile.current
    .filter((c) => c.titleStatus !== 'draft' || import.meta.env.DEV)
    .map((c) => ({ '@type': 'Organization', name: org(c.organisation).name, url: org(c.organisation).url }));
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: profile.name.full,
    alternateName: [profile.name.preferred, profile.name.scholarly],
    givenName: 'Osasumwen',
    familyName: 'Imarhiagbe',
    url: `${SITE}/`,
    image: opts.image ?? `${SITE}/og/default.png`,
    jobTitle: profile.current.map((c) => roleTitle(c).title),
    description: profile.positioning,
    worksFor,
    alumniOf: alumni,
    knowsAbout: profile.knowsAbout,
    homeLocation: { '@type': 'Place', name: profile.location.display },
    nationality: { '@type': 'Country', name: profile.origin.country },
    identifier: { '@type': 'PropertyValue', propertyID: 'ORCID', value: profile.identifiers.orcid },
    sameAs: [...profile.links.map((l) => l.href), ...profile.profiles.map((p) => p.href)],
  };
}

export function websiteNode(): Node {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE}/`,
    name: `${profile.name.preferred}: ${profile.headline}`,
    publisher: { '@id': PERSON_ID },
    inLanguage: 'en-CA',
  };
}

export function breadcrumbs(items: { name: string; url: string }[]): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url.startsWith('http') ? it.url : `${SITE}${it.url}`,
    })),
  };
}

export function graph(...nodes: Node[]): Node {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

export function organisationNodes(): Node[] {
  return organisations
    .filter((o) => o.url && o.status !== 'draft')
    .map((o) => ({ '@type': 'Organization', name: o.name, url: o.url, sameAs: o.sameAs }));
}
