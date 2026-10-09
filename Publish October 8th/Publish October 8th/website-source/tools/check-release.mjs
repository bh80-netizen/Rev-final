import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const preview = process.argv.includes('--preview');
const directory = preview ? 'dist-preview' : 'dist';
const manifest = JSON.parse(await readFile(path.join(root, preview ? 'preview-manifest.json' : 'release-manifest.json')));
const cloudflare = manifest.hostingProfile === 'cloudflare-pages';
const origin = 'https://riceelectricvehicle.org';
const canonicalPath = (file) => file === 'index.html' ? '/' : `/${cloudflare ? file.replace('.html', '') : file}`;
const hashes = new Map();
const checks = [];
const htmlByFile = new Map();

for (const file of manifest.files) {
  assert(!/Photos|deprecate|model-source|previews|README|\.obj$|\.mtl$|\.env|node_modules/.test(file.path), file.path);
  const bytes = await readFile(path.join(root, directory, file.path));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, file.path);
  hashes.set(file.path, file.sha256);
}
checks.push('Artifact hashes match; originals, source CAD, archives and private/runtime files excluded.');

for (const file of manifest.pages) {
  const html = await readFile(path.join(root, directory, file), 'utf8');
  htmlByFile.set(file, html);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${file}: h1`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size, `${file}: duplicate IDs`);
  assert.equal(/noindex/i.test(html), preview, `${file}: indexing state`);
  assert(html.includes(`rel="canonical" href="${origin}${canonicalPath(file)}"`), `${file}: canonical`);
  for (const field of ['description', 'og:title', 'og:description', 'og:url', 'og:image', 'twitter:card', 'twitter:image']) {
    assert(html.includes(`="${field}"`), `${file}: ${field}`);
  }
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert(scripts.length, `${file}: structured data`);
  for (const script of scripts) {
    const data = JSON.parse(script[1]);
    assert.equal(data['@context'], 'https://schema.org');
    assert(data['@graph'].some((item) => item['@id'] === `${origin}${canonicalPath(file)}#webpage`));
  }
  for (const image of html.matchAll(/<img\b[^>]*>/g)) assert(/\balt="[^"]*"/.test(image[0]), `${file}: image alt`);
}
const homepage = htmlByFile.get('index.html');
const description = 'Rice Electric Vehicle (REV) is Rice University’s student-led solar racing team, competing in the Formula Sun Grand Prix and American Solar Challenge. Join or support us.';
assert(homepage.includes(`<meta name="description" content="${description}">`));
assert(homepage.includes('<title>Rice Solar Racing | Rice Electric Vehicle (REV)</title>'));
assert(htmlByFile.get('car.html').includes('datetime="2027-01">January 2027'));
assert(!htmlByFile.get('about.html').includes('Local review draft'));
assert.equal((htmlByFile.get('join.html').match(/disabled data-application=/g) || []).length, 2);
assert(!htmlByFile.get('join.html').includes('Member and lead application forms are coming soon.'));
const sitemap = await readFile(path.join(root, directory, 'sitemap.xml'), 'utf8');
const sitemapURLs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
assert.deepEqual(sitemapURLs, manifest.pages.map((file) => `${origin}${canonicalPath(file)}`).sort());
checks.push('Six page titles/descriptions, canonicals, JSON-LD, alt text, IDs, timeline and sitemap validated.');
checks.push('Approved title/description and Coming soon application strategy preserved.');

// Check local page links and fragment targets in the actual built HTML.
for (const [file, html] of htmlByFile) {
  for (const match of html.matchAll(/(?:href|src|data-model)="([^"]+)"/g)) {
    const value = match[1];
    if (/^(mailto:|tel:|data:)/.test(value)) continue;
    const url = new URL(value, `${origin}/${file}`);
    if (url.origin !== origin) continue;
    let destination = decodeURIComponent(url.pathname.slice(1)) || 'index.html';
    if (!path.posix.extname(destination)) destination += '.html';
    assert(hashes.has(destination), `${file}: missing ${destination}`);
    if (url.hash && destination.endsWith('.html')) {
      const target = htmlByFile.get(destination) || await readFile(path.join(root, directory, destination), 'utf8');
      assert(target.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `${file}: missing fragment ${value}`);
    }
  }
}
checks.push('All built local links, images, model references and linked fragments resolve.');
for (const asset of manifest.assets.filter((a) => a.output.endsWith('.css'))) {
  const css = await readFile(path.join(root, directory, asset.output), 'utf8');
  for (const match of css.matchAll(/url\(["']?([^\s"')]+)["']?\)/g)) {
    if (match[1].startsWith('data:') || /^https?:/.test(match[1])) continue;
    const url = new URL(match[1], `${origin}/${asset.output}`);
    assert(hashes.has(url.pathname.slice(1)), `${asset.output}: missing CSS asset ${match[1]}`);
  }
}
checks.push('Fingerprinted CSS font/background references resolve.');

const allocator = createServer();
await new Promise((resolve) => allocator.listen(0, '127.0.0.1', resolve));
const port = allocator.address().port;
await new Promise((resolve) => allocator.close(resolve));
const child = spawn(process.execPath, [path.join(root, 'tools/start-release.mjs'), ...(preview ? ['--preview'] : [])], {
  cwd: root, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
child.stdout.on('data', (data) => { logs += data; });
child.stderr.on('data', (data) => { logs += data; });
let serverExited = false;
child.on('exit', () => { serverExited = true; });
const request = (url, options) => fetch(`http://127.0.0.1:${port}${url}`, { redirect: 'manual', ...options });
try {
  let ready = false;
  for (let attempt = 0; attempt < 100 && !serverExited; attempt++) {
    try { await request('/'); ready = true; break; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert(ready, `Production server failed to start: ${logs}`);
  for (const file of manifest.pages) {
    const response = await request(canonicalPath(file));
    assert.equal(response.status, 200, file);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert(response.headers.get('cache-control').includes('must-revalidate'));
    assert.equal(response.headers.get('x-robots-tag')?.includes('noindex') || false, preview);
  }
  for (const [from, to] of [['/index.html', '/'], ['/season.html', cloudflare ? '/car' : '/car.html']]) {
    const response = await request(from);
    assert.equal(response.status, 301, from);
    assert.equal(response.headers.get('location'), to, from);
  }
  for (const url of ['/not-a-real-page', '/Photos/original.jpeg', '/deprecate/', '/.git/config', '/package.json', '/assets/']) {
    assert.equal((await request(url)).status, 404, url);
  }
  for (const entry of manifest.assets) {
    const response = await request(`/${entry.output}`, { method: 'HEAD' });
    assert.equal(response.status, 200, entry.output);
    if (entry.immutable) assert(response.headers.get('cache-control').includes('immutable'), entry.output);
  }
  const model = manifest.assets.find((asset) => asset.source.endsWith('carrera.glb'));
  const response = await request(`/${model.output}`);
  assert.equal(response.headers.get('content-type'), 'model/gltf-binary');
  const etag = response.headers.get('etag');
  await response.arrayBuffer();
  assert(etag);
  assert.equal((await request(`/${model.output}`, { headers: { 'If-None-Match': etag } })).status, 304);
  const packet = await request('/assets/docs/REV-Sponsorship-Packet-2027.pdf', { method: 'HEAD' });
  assert.equal(packet.status, 200);
  assert.equal(packet.headers.get('content-type'), 'application/pdf');
  checks.push('Production server: page/asset responses, redirects, true 404s, directory isolation, headers, model caching/304 and PDF MIME passed.');
} finally {
  if (!serverExited) {
    const stopped = new Promise((resolve) => child.once('exit', resolve));
    child.kill('SIGTERM');
    await stopped;
  }
}
const report = { mode: manifest.mode, hostingProfile: manifest.hostingProfile, fileCount: manifest.files.length, bytes: manifest.bytes, checks };
const reportPath = path.join(root, preview ? 'preview-validation.json' : 'release-validation.json');
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
