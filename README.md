# RR Acessorios

Loja em Next.js 15 + Neon (Postgres) + Vercel Blob. Pedido finalizado pelo WhatsApp.

## Rodar localmente

```bash
npm install
npm run dev
```

Copie `.env.example` para `.env.local` e preencha (ou `vercel env pull .env.local`).

## Banco

Execute `src/lib/schema.sql` no SQL Editor do Neon.

## Admin

- `/admin/login` (somente senha, definida em `ADMIN_PASSWORD`)
- Fotos sao reduzidas no navegador (max 1200px, WebP) antes do upload para o Blob.
- Ao trocar ou apagar um produto, a imagem antiga e removida do Blob.

## Custo na Vercel

A home e estatica e so e regenerada quando um produto e criado/editado/apagado,
entao visitas nao executam funcoes nem consultam o banco.
