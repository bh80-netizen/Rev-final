import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { stat } from 'node:fs/promises';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = process.argv.includes('--preview') ? 'dist-preview' : 'dist';
await stat(path.join(root, directory, 'index.html'));
const port = process.env.PORT || (directory === 'dist-preview' ? '3001' : '3000');
const server = spawn(process.execPath, [
  path.join(root, 'node_modules/serve/build/main.js'), directory,
  '--config', path.join(root, directory, 'serve.json'), '--listen', port, '--no-clipboard',
], { cwd: root, stdio: 'inherit', env: { ...process.env, NO_UPDATE_CHECK: '1' } });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.kill(signal));
server.on('exit', (code) => process.exit(code || 0));
server.on('error', (error) => { console.error(error.message); process.exit(1); });
