# STORE

E-commerce fullstack premium para uma loja moderna de acessórios, feito com Next.js 15, TypeScript, Tailwind CSS, Supabase, Supabase Storage, Framer Motion, shadcn/ui e Lucide React.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS v4
- Supabase Auth, Database e Storage
- Server Actions e API Routes
- Framer Motion
- shadcn/ui local
- Lucide React

## Estrutura

```txt
src/app
src/app/admin
src/app/api/products
src/app/actions
src/components
src/components/admin
src/components/ui
src/lib
src/services
src/store
src/supabase
src/types
supabase/schema.sql
```

## Rodar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Supabase

1. Crie um projeto no Supabase.
2. No SQL Editor, execute `supabase/schema.sql`.
3. Em Authentication, crie o usuário administrador por email e senha.
4. Copie `.env.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_WHATSAPP_NUMBER=
```

`SUPABASE_SERVICE_ROLE_KEY` fica somente no servidor. Não exponha essa chave no browser.

## Admin

- Login: `/admin/login`
- Dashboard: `/admin`
- CRUD completo de produtos
- Upload real para o bucket `product-images`

## API

- `GET /api/products` retorna o catálogo em JSON.
