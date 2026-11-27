const fs = require('fs');
const path = require('path');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue;
    const i = line.indexOf('=');
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(path.join(__dirname, '..', '.env'));

if (!process.env.ADMIN_EMAIL?.trim()) {
  console.error(
    '\nFATAL: ADMIN_EMAIL é obrigatória.\nDefina no arquivo .env — o site não inicia sem ela.\n',
  );
  process.exit(1);
}

if (!process.env.ADMIN_PASSWORD?.trim()) {
  console.error(
    '\nFATAL: ADMIN_PASSWORD é obrigatória.\n' +
      'Defina no .env — ela é aplicada ao admin no startup do site.\n',
  );
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim()) {
  console.error(
    '\nFATAL: NEXT_PUBLIC_RECAPTCHA_SITE_KEY é obrigatória.\n' +
      'Crie as chaves em https://www.google.com/recaptcha/admin (reCAPTCHA v2).\n',
  );
  process.exit(1);
}

if (!process.env.RECAPTCHA_SECRET_KEY?.trim()) {
  console.error(
    '\nFATAL: RECAPTCHA_SECRET_KEY é obrigatória.\n' +
      'Crie as chaves em https://www.google.com/recaptcha/admin (reCAPTCHA v2).\n',
  );
  process.exit(1);
}

if (process.env.NODE_ENV === 'production') {
  const jwt = process.env.JWT_SECRET?.trim() || '';
  if (!jwt || jwt.length < 32 || /change|dev-secret|troque/i.test(jwt)) {
    console.error(
      '\nFATAL: Em produção, JWT_SECRET deve ser forte (mín. 32 caracteres).\n',
    );
    process.exit(1);
  }
}
