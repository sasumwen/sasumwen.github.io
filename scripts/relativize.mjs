#!/usr/bin/env node
/**
 * Rewrite a PREVIEW_RELATIVE build (see astro.config.mjs) so every root-relative URL
 * becomes relative to the file that references it. The result can be opened from any
 * folder or sub-path (e.g. a hosted preview) without a web root.
 *
 *   PREVIEW_RELATIVE=true PUBLIC_SHOW_DRAFTS=true npx astro build
 *   node scripts/relativize.mjs dist
 *
 * Production builds never go through this script.
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, relative, posix } from 'node:path';

const root = process.argv[2] ?? 'dist';

async function walk(dir, out = []) {
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    const s = await stat(p);
    if (s.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = await walk(root);
const htmlFiles = new Set(files.filter((f) => f.endsWith('.html')).map((f) => posix.normalize(relative(root, f).split('\\').join('/'))));

/** Map a site path ("/work/studyradar/", "/about", "/resume.pdf", "/") to a file path in dist. */
function targetFor(sitePath) {
  let p = sitePath.replace(/^\//, '');
  if (p === '') return 'index.html';
  if (/\.[a-z0-9]+$/i.test(p)) return p; // has an extension already
  p = p.replace(/\/$/, '');
  if (htmlFiles.has(`${p}.html`)) return `${p}.html`;
  if (htmlFiles.has(`${p}/index.html`)) return `${p}/index.html`;
  return `${p}.html`;
}

function rel(fromFile, toPath) {
  const fromDir = posix.dirname(fromFile);
  let r = posix.relative(fromDir === '.' ? '' : fromDir, toPath);
  if (!r.startsWith('.')) r = `./${r}`;
  return r;
}

const attrRe = /\b(href|src|content|poster|data-lb-src)=("|')(\/[^"'#?]*)([#?][^"']*)?\2/g;
const srcsetRe = /\bsrcset=("|')([^"']+)\1/g;
const cssUrlRe = /url\((["']?)(\/[^)"']+)\1\)/g;

let changed = 0;
for (const abs of files) {
  const file = posix.normalize(relative(root, abs).split('\\').join('/'));
  if (!/\.(html|css|js|xml|txt)$/.test(file)) continue;
  let text = await readFile(abs, 'utf8');
  const before = text;

  if (file.endsWith('.html')) {
    text = text.replace(attrRe, (m, attr, q, path, tail = '') => {
      if (attr === 'content' && !path.startsWith('/_astro/') && !path.startsWith('/og/')) return m; // leave meta that is not an asset
      if (path.startsWith('//')) return m;
      return `${attr}=${q}${rel(file, targetFor(path))}${tail}${q}`;
    });
    text = text.replace(srcsetRe, (_m, q, list) => {
      const out = list
        .split(',')
        .map((part) => {
          const [url, desc] = part.trim().split(/\s+/);
          if (!url || !url.startsWith('/')) return part.trim();
          return [rel(file, targetFor(url)), desc].filter(Boolean).join(' ');
        })
        .join(', ');
      return `srcset=${q}${out}${q}`;
    });
    // inline <style> url(/_astro/…)
    text = text.replace(cssUrlRe, (m, q, path) => `url(${q}${rel(file, targetFor(path))}${q})`);
  } else if (file.endsWith('.css')) {
    text = text.replace(cssUrlRe, (m, q, path) => `url(${q}${rel(file, targetFor(path))}${q})`);
  }

  if (text !== before) {
    await writeFile(abs, text);
    changed++;
  }
}
console.log(`relativize: rewrote ${changed} file(s) under ${root}`);
