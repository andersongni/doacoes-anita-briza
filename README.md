# Núcleo Assistencial Anita Briza

Site CMS de campanhas e doações em **um único app Next.js** (App Router). Não há API separada exposta: formulários usam Server Actions no mesmo origin.

**Repositório:** https://github.com/andersongni/doacoes-anita-briza  
**Licença:** [MIT](./LICENSE)

## Stack

- Next.js 15 + React 19
- Prisma + SQLite
- Sessão em cookie httpOnly
- Google reCAPTCHA v2 (login, cadastro e doação)
- Markdown com imagens no conteúdo de páginas/publicações

## Pré-requisitos

- Node.js **20+**
- npm
- Conta reCAPTCHA v2: https://www.google.com/recaptcha/admin

## Configuração rápida

```bash
cp .env.example .env
```

Preencha no `.env`:

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `ADMIN_EMAIL` | sim | Conta inicial autoaprovada |
| `ADMIN_PASSWORD` | sim (seed) | Senha inicial do bootstrap |
| `JWT_SECRET` | sim | Segredo da sessão (forte em produção) |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | sim | Site key reCAPTCHA v2 |
| `RECAPTCHA_SECRET_KEY` | sim | Secret key reCAPTCHA v2 |
| `PORT` | não | Porta HTTP (padrão `3000`) |
| `HOST` | não | Host (padrão `127.0.0.1`) |
| `DATABASE_URL` | sim | Ex.: `file:./dev.db` |
| `NEXT_PUBLIC_SITE_URL` | recomendado | URL pública (links de compartilhamento) |

```bash
npm install
npx prisma db push
npm run seed
npm run dev
```

Site: `http://127.0.0.1:3000` (ou a porta do `.env`).

## Scripts Windows (desenvolvimento)

Na raiz do projeto:

| Arquivo | Função |
|---------|--------|
| `iniciar.bat` | Sobe o site em modo dev (`npm run dev`), cria banco/seed se preciso e abre o navegador |
| `parar.bat` | Encerra o processo do site (via PID salvo e/ou porta) |

Detalhes:

- `iniciar.bat` chama `scripts/iniciar.ps1`
- `parar.bat` chama `scripts/parar.ps1`
- Logs e PID ficam em `.runtime/`
- A porta lida é a de `PORT` no `.env`

**PowerShell (se a política de execução bloquear):**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\iniciar.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\parar.ps1
```

## Área logada

1. Cadastre-se ou entre com `ADMIN_EMAIL`
2. Acesse **Área logada** (`/painel`)
3. Abas: Publicações, Páginas, Usuários, Doadores, Configurações

A página de agradecimento (`slug` `obrigado`) e a mensagem de compartilhamento são editáveis no painel. Placeholders: `{nome}`, `{valor}`, `{url}`.

## Imagens no conteúdo

Editor visual (estilo Word) em Publicações e Páginas:

1. Escreva o texto normalmente
2. **Inserir imagem** pela barra de ferramentas
3. **Clique na imagem** para abrir o menu:
   - **Tamanho** — pequena, média, grande, largura da página
   - **Texto em volta** — alinhado ao texto, texto à direita, texto à esquerda, acima e abaixo
   - Texto alternativo e remover

Sem digitar código.

## Pacote standalone (Windows)

O workflow GitHub Actions [`.github/workflows/windows-standalone.yml`](./.github/workflows/windows-standalone.yml) gera um ZIP com o build `output: 'standalone'` para rodar no Windows.

### Baixar o artefato

1. Abra a aba **Actions** do repositório
2. Workflow **Pacote standalone Windows**
3. Baixe o artifact `anita-briza-windows-standalone`

Em releases publicados, o ZIP também é anexado automaticamente.

### Gerar localmente

```bash
npm ci
npx prisma generate
npm run build
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\pack-standalone.ps1
```

Saída: `dist-standalone/anita-briza-windows-standalone.zip`

### Usar o pacote

1. Extraia o ZIP
2. Copie `.env.example` → `.env` e preencha
3. Execute `iniciar.bat`
4. Para encerrar: `parar.bat`

Instruções extras vêm no `README-WINDOWS.txt` dentro do ZIP. É necessário **Node.js 20+** na máquina de destino.

## Scripts npm

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Desenvolvimento |
| `npm run build` | Build de produção (standalone) |
| `npm start` | Sobe o build local |
| `npm run seed` | Seed do banco |
| `npx prisma db push` | Aplica o schema |

## Produção

1. `NODE_ENV=production`, `JWT_SECRET` forte, chaves reCAPTCHA do domínio
2. HTTPS no domínio
3. Preferir PostgreSQL (`DATABASE_URL=postgresql://...`) em ambientes maiores
4. Um único serviço Next.js (sem porta de API separada)
