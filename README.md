# Gestão Receitas

Catálogo de receitas culinárias com cadastro de usuários, upload de imagens, planejamento semanal de refeições e uma camada social (seguir usuários, feed, sugestões).

## Stack

- **Frontend**: React + Vite + TypeScript, React Router, Axios, Vitest + Testing Library
- **Backend**: Node.js + Express + TypeScript, Zod, Jest + Supertest
- **Banco de dados**: PostgreSQL (NEON)
- **Autenticação**: JWT (email/senha) + OAuth Google
- **Upload de imagens**: Cloudinary

## Estrutura do projeto

```
backend/     API REST (Express)
frontend/    SPA (React + Vite)
```

## Funcionalidades

- Cadastro/login (email+senha e Google OAuth)
- CRUD de receitas com upload de imagem
- Busca e filtros de receitas (título, categoria, tempo de preparo, autor)
- Favoritar receitas
- Planejamento semanal de refeições com lista de compras automática
- Área social: busca de usuários, seguir/deixar de seguir, perfil público, feed de quem você segue, sugestões por popularidade
- Abas na tela de Receitas: Minhas receitas / Feed / Explorar

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
| `GOOGLE_CALLBACK_URL` | URL de callback do OAuth (deve estar cadastrada no Google Console) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Credenciais Cloudinary |
| `FRONTEND_URL` | URL do frontend (usada em CORS e no redirect do OAuth) |

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # ajuste VITE_API_URL se necessário
npm run dev             # http://localhost:5173
```

## Testes

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Deploy

- **Backend**: Railway (ou similar)
- **Frontend**: Vercel (ou similar)

Antes do deploy, configure as variáveis de ambiente de produção em cada plataforma (mesmas do `.env`, com valores de produção — gere um `JWT_SECRET` novo e cadastre a URL de callback de produção no Google Console). Rode `npm run migrate` apontando para o banco de produção após o primeiro deploy do backend.
