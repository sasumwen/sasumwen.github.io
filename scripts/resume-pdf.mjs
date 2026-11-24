#!/usr/bin/env node
/**
 * Prints the built /resume/ page to public/resume.pdf (and dist/resume.pdf),
 * so the downloadable PDF always carries the same approved facts as the site.
 *
 * Uses the Chrome or Chromium already installed on the machine; adds no dependency.
 * Run after a production build, never after `build:preview`, or draft items would
 * be printed:
 *
 *   npm run build && npm run resume:pdf
 *
 * Set CHROME_PATH if the browser is not on PATH.
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, copyFileSync } from 'node:fs';
import { join, resolve, extname, normalize } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const SITE = 'https://osasumwen.com';
const dist = resolve('dist');
const page = join(dist, 'resume', 'index.html');
if (!existsSync(page)) {
  console.error('dist/resume/index.html not found. Run `npm run build` first.');
  process.exit(1);
}
if (/class="[^"]*draft-badge/.test(readFileSync(page, 'utf8'))) {
  console.error('dist/ was built with drafts shown. Run `npm run build` (not build:preview) first.');
  process.exit(1);
}

const candidates = [process.env.CHROME_PATH, 'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'].filter(Boolean);
const chrome = candidates.find((c) => spawnSync(c, ['--version'], { stdio: 'ignore' }).status === 0);
if (!chrome) {
  console.error('No Chrome or Chromium found. Set CHROME_PATH.');
  process.exit(1);
}

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

const server = createServer((req, res) => {
  let rel = normalize(decodeURIComponent((req.url ?? '/').split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  let file = join(dist, rel);
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  if (!file.startsWith(dist) || !existsSync(file)) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  if (file === page) {
    // Links in the PDF must point at the live site, not at this temporary server.
    res.end(readFileSync(file, 'utf8').replace(/(<a\b[^>]*?\shref=")\/(?!\/)/g, `$1${SITE}/`));
    return;
  }
  res.end(readFileSync(file));
});

server.listen(0, '127.0.0.1', () => {
  const { port } = server.address();
  const out = resolve('public', 'resume.pdf');
  // Asynchronous on purpose: the server above has to keep answering while Chrome prints.
  const run = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${out}`, `http://127.0.0.1:${port}/resume/`], {
    stdio: ['ignore', 'ignore', 'pipe'],
    timeout: 60_000,
  });
  let stderr = '';
  run.stderr.on('data', (d) => (stderr += d));
  run.on('close', (code) => {
    server.close();
    if (code !== 0 || !existsSync(out)) {
      console.error(stderr || 'Chrome did not produce a PDF.');
      process.exit(1);
    }
    copyFileSync(out, join(dist, 'resume.pdf'));
    console.log(`Wrote public/resume.pdf and dist/resume.pdf (${Math.round(statSync(out).size / 1024)} kB).`);
  });
});
