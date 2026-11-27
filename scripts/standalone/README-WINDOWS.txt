Anita Briza — pacote standalone (Windows)
========================================

Requisitos
----------
- Windows 10/11 x64
- Node.js 20+ no PATH (https://nodejs.org)

Primeiro uso
------------
1. Extraia o ZIP em uma pasta (ex.: C:\anita-briza).
2. Copie .env.example para .env e preencha:
   - ADMIN_EMAIL
   - ADMIN_PASSWORD (senha inicial)
   - JWT_SECRET (forte em produção)
   - NEXT_PUBLIC_RECAPTCHA_SITE_KEY
   - RECAPTCHA_SECRET_KEY
   - PORT (padrão 3000)
3. Duplo clique em iniciar.bat
   - Na primeira execução o script cria o banco SQLite e páginas básicas.
4. Abra http://127.0.0.1:PORT
5. Cadastre-se com o mesmo e-mail de ADMIN_EMAIL (conta autoaprovada) e acesse o painel.

Parar
-----
Execute parar.bat (ou feche a janela do servidor).

Atualizar
---------
Pare o site, substitua os arquivos pelo novo pacote (preserve .env e prisma\*.db
se quiser manter dados), e inicie novamente.

Suporte
-------
Repositório: https://github.com/andersongni/doacoes-anita-briza
Licença: MIT
