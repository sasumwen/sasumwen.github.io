#!/usr/bin/env node
/**
 * Internal link & asset checker for the built site (dist/).
 * Fails the build if any same-site href/src points at a missing file.
 * Usage: node scripts/check-links.mjs [dist]
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';

const dist = resolve(process.argv[2] ?? 'dist');
const htmlFiles = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name.endsWith('.html')) htmlFiles.push(p);
  }
})(dist);

const attrRe = /\s(href|src|srcset|content)=["']([^"']+)["']/g;
const problems = [];
let checked = 0;

function exists(urlPath) {
  const clean = decodeURIComponent(urlPath.split('#')[0].split('?')[0]);
  if (clean === '' || clean === '/') return existsSync(join(dist, 'index.html'));
  const candidates = [join(dist, clean), join(dist, clean, 'index.html'), join(dist, clean + '.html')];
  return candidates.some((c) => existsSync(c));
}

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  let m;
  while ((m = attrRe.exec(html))) {
    const attr = m[1];
    const raw = m[2];
    if (attr === 'content' && !/^(\/|https?:\/\/)/.test(raw)) continue;
    const values = attr === 'srcset' ? raw.split(',').map((s) => s.trim().split(/\s+/)[0]) : [raw];
    for (const v of values) {
      if (!v || v.startsWith('#') || v.startsWith('mailto:') || v.startsWith('tel:') || v.startsWith('data:') || v.startsWith('javascript:')) continue;
      let pathOnly = v;
      if (/^https?:\/\//.test(v)) {
        const u = new URL(v);
        if (u.hostname !== 'osasumwen.com') continue;
        pathOnly = u.pathname;
      } else if (!v.startsWith('/')) {
        pathOnly = '/' + join(dirname(file).slice(dist.length), v).replace(/\\/g, '/');
      }
      checked++;
      if (!exists(pathOnly)) problems.push(`${file.slice(dist.length)} → ${v}`);
    }
  }
}

const unique = [...new Set(problems)];
console.log(`Checked ${checked} internal references in ${htmlFiles.length} pages.`);
if (unique.length) {
  console.error(`\n${unique.length} broken internal reference(s):`);
  for (const p of unique) console.error('  ' + p);
  process.exit(1);
}
console.log('No broken internal links.');
