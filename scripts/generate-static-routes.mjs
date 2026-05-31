import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const sourceIndex = join(distDir, 'index.html');

const routes = [
  'o-mne',
  'ponuka',
  'torty-na-mieru',
  'candy-bar',
  'svadobne-vysluzky',
  'ochutnavkovy-box',
  'galeria',
  'objednavka',
  'kontakt',
];

for (const route of routes) {
  const routeDir = join(distDir, route);
  mkdirSync(routeDir, { recursive: true });
  copyFileSync(sourceIndex, join(routeDir, 'index.html'));
}
