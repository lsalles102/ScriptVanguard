
# Guia de Deploy do FovDark para Railway

Este guia explica como fazer o deploy do FovDark, sua loja cyberpunk de scripts e cheats para BloodStrike, usando Railway e Supabase.

## Pré-requisitos

1. Conta no [Railway](https://railway.app)
2. Projeto criado no [Supabase](https://supabase.com)
3. Banco de dados PostgreSQL configurado no Supabase

## Passo 1: Deploy do Backend

1. No Railway, crie um novo projeto
2. Selecione "Deploy from GitHub repo"
3. Configure as seguintes variáveis de ambiente:
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   SESSION_SECRET=your-secret-key
   CORS_ORIGIN=https://your-frontend-url.railway.app
   NODE_ENV=production
   ```
4. No diretório `backend`, configure o script de build:
   ```json
   {
     "scripts": {
       "build": "tsc",
       "start": "node dist/index.js"
     }
   }
   ```

## Passo 2: Deploy do Frontend

1. Crie outro projeto no Railway
2. Selecione "Deploy from GitHub repo"
3. Configure as variáveis de ambiente:
   ```
   VITE_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   VITE_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
   VITE_API_URL=https://your-backend-url.railway.app
   ```
4. No diretório `frontend`, o Railway detectará automaticamente o projeto Vite

## Passo 3: Configurar CORS no Backend

Atualize o arquivo `backend/src/index.ts` para usar a origem correta:

```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

## Passo 4: Configurar o Banco de Dados

1. No dashboard do Supabase, vá para "Database"
2. Execute o comando de migração:
   ```bash
   npm run db:push
   ```
3. Execute o seed se necessário:
   ```bash
   npm run db:seed
   ```

## Passo 5: Verificar Deploy

1. Acesse a URL do frontend fornecida pelo Railway
2. Verifique se todas as funcionalidades estão funcionando
3. Teste o login e outras funcionalidades principais

## Suporte

Se precisar de ajuda, abra uma issue no repositório do projeto.
