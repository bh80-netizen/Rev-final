import { readFile, writeFile, mkdir, readdir, rename, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'rice-motorsport-site');
const preview = process.argv.includes('--preview');
const cloudflarePages = process.argv.includes('--cloudflare-pages');
const output = path.join(root, preview ? 'dist-preview' : 'dist');
const pages = ['index.html', 'car.html', 'about.html', 'join.html', 'sponsorship.html', 'contact.html', '404.html'];
const origin = 'https://riceelectricvehicle.org';
const digest = (data) => createHash('sha256').update(data).digest('hex');
const manifest = new Map();
const building = new Set();
const pagePaths = (text) => cloudflarePages
  ? text.replace(/index\.html(?=#faq)/g, '/').replace(/(car|about|join|sponsorship|contact)\.html/g, '$1')
  : text;

// Retain an existing generated artifact outside the served directory for recovery.
try {
  await stat(output);
  const archive = path.join(root, 'deprecate', 'generated-releases');
  await mkdir(archive, { recursive: true });
  await rename(output, path.join(archive, `${path.basename(output)}-${Date.now()}`));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
await mkdir(output, { recursive: true });

function localAsset(value, from = 'index.html') {
  if (/^(data:|mailto:|tel:|#)/i.test(value)) return null;
  let relative;
  if (/^https?:\/\//.test(value)) {
    const url = new URL(value);
    if (url.origin !== origin) return null;
    relative = url.pathname.slice(1);
  } else if (value.startsWith('assets/') || value.startsWith('/assets/')) {
    relative = value.replace(/^\//, '').split(/[?#]/)[0];
  } else {
    relative = path.posix.normalize(path.posix.join(path.posix.dirname(from), value.split(/[?#]/)[0]));
  }
  if (!relative.startsWith('assets/')) return null;
  if (relative.includes('..') || !/\.(css|js|svg|png|webp|jpe?g|ttf|woff2?|glb|pdf)$/i.test(relative)) {
    throw new Error(`Unapproved asset reference: ${value}`);
  }
  return relative;
}

function assetReferences(text, file) {
  const refs = new Set();
  const candidates = [...text.matchAll(/(?:src|href|data-model|content)=["']([^"']+)["']/g)].map((m) => m[1]);
  candidates.push(...[...text.matchAll(/url\(["']?([^\s"')]+)["']?\)/g)].map((m) => m[1]));
  // Also include asset URLs inside JSON-LD and JavaScript fallback defaults.
  candidates.push(...[...text.matchAll(/["']((?:https:\/\/riceelectricvehicle\.org\/)?\/?assets\/[^"']+)["']/g)].map((m) => m[1]));
  for (const value of candidates) {
    const asset = localAsset(value, file);
    if (asset) refs.add(asset);
  }
  return [...refs];
}

function replaceReferences(text, from, refs) {
  for (const relative of refs) {
    const destination = manifest.get(relative).output;
    const relativeURL = path.posix.relative(path.posix.dirname(from), relative);
    const newRelativeURL = path.posix.relative(path.posix.dirname(from), destination);
    const pairs = [
      [`${origin}/${relative}`, `${origin}/${destination}`],
      [`/${relative}`, `/${destination}`],
      [relative, destination],
      [relativeURL, newRelativeURL],
    ];
    const seen = new Set();
    for (const [before, after] of pairs) {
      if (before === after || seen.has(before)) continue;
      seen.add(before);
      // Exact URLs only, retaining fragment/query suffixes when present.
      text = text.replaceAll(before, after);
    }
  }
  return text;
}

async function emitAsset(relative) {
  if (manifest.has(relative)) return;
  if (building.has(relative)) throw new Error(`Cyclic asset reference: ${relative}`);
  building.add(relative);
  let data = await readFile(path.join(source, relative));
  if (/\.(css|js|svg)$/.test(relative)) {
    const text = data.toString();
    const refs = assetReferences(text, relative).filter((ref) => ref !== relative);
    for (const ref of refs) await emitAsset(ref);
    data = Buffer.from(replaceReferences(text, relative, refs));
  }
  const sha256 = digest(data);
  // Stable favicon and packet URLs remain easy to bookmark and share.
  const stable = relative.startsWith('assets/brand/') || relative.startsWith('assets/docs/');
  const extension = path.posix.extname(relative);
  const destination = stable ? relative : `${relative.slice(0, -extension.length)}.${sha256.slice(0, 12)}${extension}`;
  await mkdir(path.dirname(path.join(output, destination)), { recursive: true });
  await writeFile(path.join(output, destination), data);
  manifest.set(relative, { source: relative, output: destination, bytes: data.length, sha256, immutable: !stable });
  building.delete(relative);
}

for (const file of pages) {
  let text = await readFile(path.join(source, file), 'utf8');
  const refs = assetReferences(text, file);
  for (const ref of refs) await emitAsset(ref);
  text = replaceReferences(text, file, refs);
  text = pagePaths(text);
  if (preview && file !== '404.html') {
    text = text.replace('</head>', '<meta name="robots" content="noindex,nofollow">\n</head>');
  }
  if (!preview && file !== '404.html' && /noindex/i.test(text)) throw new Error(`${file} is not indexable`);
  await writeFile(path.join(output, file), text);
}

for (const file of ['robots.txt', 'sitemap.xml', '_redirects']) {
  const text = await readFile(path.join(source, file), 'utf8');
  await writeFile(path.join(output, file), pagePaths(text));
}
if (preview) await writeFile(path.join(output, 'robots.txt'), 'User-agent: *\nAllow: /\n');

// License notices accompany the redistributed font files.
for (const name of ['Lato', 'Cormorant Garamond']) {
  const destination = path.join(output, 'LICENSES', name);
  await mkdir(destination, { recursive: true });
  await writeFile(path.join(destination, 'OFL.txt'), await readFile(path.join(root, 'LICENSES', name, 'OFL.txt')));
}

const globalHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
];
if (preview) globalHeaders.push({ key: 'X-Robots-Tag', value: 'noindex, nofollow' });
const assetHeader = { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' };
const headers = [{ source: '**', headers: globalHeaders }];
for (const directory of ['css', 'js', 'fonts', 'icons', 'img', 'models']) {
  headers.push({ source: `assets/${directory}/**`, headers: [assetHeader] });
}
const redirects = [
  { source: '/index.html', destination: '/', type: 301 },
  { source: '/season.html', destination: cloudflarePages ? '/car' : '/car.html', type: 301 },
  { source: '/season', destination: cloudflarePages ? '/car' : '/car.html', type: 301 },
  ...pages.filter((p) => !['index.html', '404.html'].includes(p)).map((p) => ({
    source: cloudflarePages ? `/${p}` : `/${p.replace('.html', '')}`,
    destination: cloudflarePages ? `/${p.replace('.html', '')}` : `/${p}`, type: 301,
  })),
];
const rewrites = [{ source: '/', destination: '/index.html' }];
if (cloudflarePages) {
  for (const p of pages.filter((p) => !['index.html', '404.html'].includes(p))) {
    rewrites.push({ source: `/${p.replace('.html', '')}`, destination: `/${p}` });
  }
}
const config = { cleanUrls: false, directoryListing: false, rewrites, redirects, headers };
await writeFile(path.join(output, 'serve.json'), `${JSON.stringify(config, null, 2)}\n`);
// Pages merges headers from matching rules; avoid conflicting Cache-Control values.
const cloudflareHeaders = ['/*', ...globalHeaders.filter((h) => h.key !== 'Cache-Control').map((h) => `  ${h.key}: ${h.value}`)];
for (const stablePath of ['/', '/*.html', '/robots.txt', '/sitemap.xml', '/assets/brand/*', '/assets/docs/*']) {
  cloudflareHeaders.push(stablePath, '  Cache-Control: public, max-age=0, must-revalidate');
}
for (const entry of manifest.values()) {
  if (entry.immutable) cloudflareHeaders.push(`/${entry.output}`, `  ${assetHeader.key}: ${assetHeader.value}`);
}
await writeFile(path.join(output, '_headers'), `${cloudflareHeaders.join('\n')}\n`);

const files = [];
async function inventory(directory, prefix = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) await inventory(path.join(directory, entry.name), relative);
    else {
      const data = await readFile(path.join(directory, entry.name));
      files.push({ path: relative, bytes: data.length, sha256: digest(data) });
    }
  }
}
await inventory(output);
files.sort((a, b) => a.path.localeCompare(b.path));
const report = {
  mode: preview ? 'preview' : 'production',
  hostingProfile: cloudflarePages ? 'cloudflare-pages' : 'standard',
  pages: pages.filter((p) => p !== '404.html'),
  bytes: files.reduce((sum, file) => sum + file.bytes, 0),
  assets: [...manifest.values()].sort((a, b) => a.source.localeCompare(b.source)),
  files,
};
await writeFile(path.join(root, preview ? 'preview-manifest.json' : 'release-manifest.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Built ${path.basename(output)}: ${files.length} files, ${(report.bytes / 1e6).toFixed(2)} MB; ${manifest.size} referenced assets.`);
