import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import seoConfig from '../src/seo/pageSeo.json' with { type: 'json' };

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const sourceIndex = join(distDir, 'index.html');

const { siteUrl, pages } = seoConfig;

const html = readFileSync(sourceIndex, 'utf8');

const escapeHtml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const canonicalFor = (path) => (path === '/' ? `${siteUrl}/` : `${siteUrl}${path}/`);

// Bake the per-route title / description / canonical / social URLs into the static HTML
// so crawlers see unique, content-rich metadata without executing JavaScript.
const renderRoute = ({ path, title, description }) => {
  const canonical = canonicalFor(path);
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);

  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[\s\S]*?("\s*\/>)/,
      `$1${safeDescription}$2`,
    )
    .replace(
      /(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/>)/,
      `$1${canonical}$2`,
    )
    .replace(
      /(<meta\s+property="og:url"\s+content=")[^"]*("\s*\/>)/,
      `$1${canonical}$2`,
    )
    .replace(
      /(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/>)/,
      `$1${safeTitle}$2`,
    )
    .replace(
      /(<meta\s+property="og:description"\s+content=")[\s\S]*?("\s*\/>)/,
      `$1${safeDescription}$2`,
    )
    .replace(
      /(<meta\s+name="twitter:title"\s+content=")[^"]*("\s*\/>)/,
      `$1${safeTitle}$2`,
    )
    .replace(
      /(<meta\s+name="twitter:description"\s+content=")[\s\S]*?("\s*\/>)/,
      `$1${safeDescription}$2`,
    );
};

let written = 0;
for (const page of pages) {
  const output = renderRoute(page);
  if (page.path === '/') {
    writeFileSync(sourceIndex, output);
  } else {
    const routeDir = join(distDir, page.path.replace(/^\//, ''));
    mkdirSync(routeDir, { recursive: true });
    writeFileSync(join(routeDir, 'index.html'), output);
  }
  written += 1;
}

console.log(`[seo] Wrote ${written} static route documents with per-page metadata.`);
