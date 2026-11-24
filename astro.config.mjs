// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import yaml from '@rollup/plugin-yaml';

/**
 * PREVIEW_RELATIVE=true produces a build that can be opened from any folder or
 * static host without a root (file-per-page output, no client router); the
 * post-processing step in scripts/relativize.mjs then rewrites root-relative URLs.
 * Never used for production: GitHub Pages serves the normal build from "/".
 */
const previewRelative = process.env.PREVIEW_RELATIVE === 'true';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://osasumwen.com',
  trailingSlash: previewRelative ? 'ignore' : 'always',
  output: 'static',
  // Hosted previews reserve the "_" prefix, so portable builds put assets under /assets/.
  build: previewRelative ? { format: 'file', assets: 'assets' } : { format: 'directory' },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404'),
      changefreq: 'monthly',
    }),
  ],
  prefetch: previewRelative
    ? false
    : {
        prefetchAll: true,
        defaultStrategy: 'viewport',
      },
  image: {
    // Lossless originals in src/assets are resized and converted at build time
    // (AVIF/WebP) by the default sharp service.
    responsiveStyles: true,
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'vitesse-light', dark: 'vitesse-dark' },
      defaultColor: false,
      wrap: false,
    },
  },
  redirects: previewRelative
    ? {}
    : {
        // URLs that exist on the current site and are indexed by Bing/Google.
        '/osasu1.pdf': '/resume.pdf',
        '/osasu.pdf': '/resume.pdf',
        // /feed.xml (old Jekyll feed) is served by src/pages/feed.xml.ts
      },
  vite: {
    plugins: [yaml()],
    define: {
      'import.meta.env.PUBLIC_PREVIEW_RELATIVE': JSON.stringify(previewRelative ? 'true' : 'false'),
    },
  },
});
