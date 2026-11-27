const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');

// Carrega .env da raiz
const envPath = path.join(root, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

const mode = process.argv[2] === 'start' ? 'start' : 'dev';
const port = String(process.env.PORT || 3000).trim();
const host = process.env.HOST || '127.0.0.1';

const nextCli = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
if (!fs.existsSync(nextCli)) {
  console.error('Next.js nao encontrado. Rode: npm install');
  process.exit(1);
}

console.log(`Iniciando Next.js (${mode}) em http://${host}:${port}`);

// Usa node + binario do next (evita spawn EINVAL do npx.cmd no Windows)
const child = spawn(process.execPath, [nextCli, mode, '-H', host, '-p', port], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) process.exit(1);
  process.exit(code ?? 0);
});
