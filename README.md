# Tastlyhub (Gestão Receitas)

Catálogo de receitas culinárias com cadastro de usuários, upload de imagens, planejamento semanal de refeições e uma camada social (seguir usuários, feed, sugestões).

🔗 **Produção**: [https://tastlyhub.vercel.app/](https://tastlyhub.vercel.app/)

## Stack

- **Frontend**: React + Vite + TypeScript, React Router, Axios, Vitest + Testing Library
- **Backend**: Node.js + Express + TypeScript, Zod, Jest + Supertest
- **Banco de dados**: PostgreSQL (NEON)
- **Autenticação**: JWT (email/senha) + OAuth Google
- **Upload de imagens**: Cloudinary
- **Deploy**: Vercel (frontend) + Railway (backend)

## Estrutura do projeto

```
backend/     API REST (Express)
frontend/    SPA (React + Vite), responsiva para uso mobile
```

## Funcionalidades

- Cadastro/login (email+senha e Google OAuth)
- CRUD de receitas com upload de imagem
- Busca e filtros de receitas (título, categoria, tempo de preparo, autor)
- Favoritar receitas
- Planejamento semanal de refeições com lista de compras automática
- Área social: busca de usuários, seguir/deixar de seguir, perfil público, feed de quem você segue, sugestões por popularidade
- Abas na tela de Receitas: Minhas receitas / Feed / Explorar
- Layout responsivo (mobile e desktop)

## Como rodar localmente

### Pré-requisitos

- Node.js 20+
- Um banco PostgreSQL (recomendado: [NEON](https://neon.tech), plano gratuito)
- Uma conta [Cloudinary](https://cloudinary.com) (plano gratuito) para upload de imagens
- Credenciais OAuth do Google ([Google Cloud Console](https://console.cloud.google.com/))

### Backend

```bash
cd backend
npm install
cp .env.example .env   # preencha com suas credenciais (veja abaixo)
npm run migrate        # cria as tabelas no banco
npm run dev             # http://localhost:3333
```

Variáveis de ambiente (`backend/.env`):

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Connection string do Postgres (NEON) |
| `JWT_SECRET` | Segredo para assinar os tokens JWT |
| `JWT_EXPIRES_IN` | Validade do token (ex: `7d`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Credenciais OAuth do Google |
| `GOOGLE_CALLBACK_URL` | URL de callback do OAuth (deve estar cadastrada no Google Console, sem barra final) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Credenciais Cloudinary |
| `FRONTEND_URL` | URL do frontend, sem barra no final (usada em CORS e no redirect do OAuth) |

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # ajuste VITE_API_URL se necessário
npm run dev             # http://localhost:5173
```

Variáveis de ambiente (`frontend/.env`):

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL completa da API backend, **incluindo `https://`** |

## Testes

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Deploy

- **Frontend**: [Vercel](https://vercel.com) — em produção em [tastlyhub.vercel.app](https://tastlyhub.vercel.app/)
  - Root Directory: `frontend`
  - Inclui `frontend/vercel.json` com rewrite para SPA (necessário para rotas do React Router, como `/oauth/callback`, funcionarem em navegação direta)
- **Backend**: [Railway](https://railway.app)
  - Root Directory: `backend`
  - Build Command: `npm run build` · Start Command: `npm start`

### Checklist antes de configurar produção

1. Gerar um `JWT_SECRET` novo (diferente do usado em desenvolvimento)
2. Cadastrar a URL de callback de produção do Google OAuth em **Authorized redirect URIs** no Google Cloud Console (e a origem do frontend em **Authorized JavaScript origins**)
3. Garantir que `FRONTEND_URL` (Railway) e `VITE_API_URL` (Vercel) estejam com `https://` e **sem barra final** — divergência aqui causa erro de CORS
4. Rodar `npm run migrate` apontando para o banco de produção após o primeiro deploy do backend
