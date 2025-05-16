# Guia de Deploy do FovDark para Vercel

Este guia explica como fazer o deploy do FovDark, sua loja cyberpunk de scripts e cheats para BloodStrike, usando o Vercel e o Supabase.

## Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Projeto criado no [Supabase](https://supabase.com)
3. Banco de dados PostgreSQL configurado no Supabase

## Passo 1: Configurar o Banco de Dados no Supabase

1. Acesse o dashboard do Supabase
2. Escolha seu projeto
3. Vá até a seção "Table Editor" e execute o script SQL a seguir para criar as tabelas:

```sql
-- As tabelas serão criadas automaticamente pelo Drizzle ORM
-- Para criar as tabelas, você precisará executar o comando:
-- npm run db:push
```

4. Execute o script de seed para popular o banco de dados com dados iniciais:

```bash
npm run db:seed
```

## Passo 2: Variáveis de Ambiente

Configure as seguintes variáveis de ambiente no Vercel:

- `DATABASE_URL`: A URI de conexão do seu banco de dados Supabase (formato: `postgres://[user]:[password]@[host]:[port]/[database]`)
- `VITE_SUPABASE_URL`: A URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: A chave anônima do seu projeto Supabase
- `SESSION_SECRET`: Uma string aleatória longa para criptografar as sessões
- `SENDGRID_API_KEY`: (opcional) Para enviar emails através do SendGrid

## Passo 3: Deploy no Vercel

1. No dashboard do Vercel, clique em "New Project"
2. Importe seu repositório do GitHub/GitLab/Bitbucket
3. Configure as variáveis de ambiente mencionadas acima
4. Defina as seguintes configurações:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Clique em "Deploy"

## Passo 4: Configurar CORS no Supabase

1. No dashboard do Supabase, vá para "Authentication" > "URL Configuration"
2. Adicione a URL do seu projeto Vercel nas configurações de site URL
3. Adicione a URL do seu projeto Vercel nas configurações de redirecionamento

## Passo 5: Configuração de Domínio Personalizado (opcional)

1. No dashboard do Vercel, vá para seu projeto
2. Navegue até "Settings" > "Domains"
3. Adicione seu domínio personalizado e siga as instruções para configurar os registros DNS

## Passo 6: Verificar Deploy

1. Acesse a URL fornecida pelo Vercel após o deploy
2. Verifique se todas as funcionalidades estão funcionando corretamente
3. Faça login e verifique se o painel de administração está acessível

## Problemas Comuns e Soluções

### Problema: Falha na conexão com o banco de dados
- Verifique se a variável `DATABASE_URL` está correta
- Garanta que o IP do Vercel esteja na lista de IPs permitidos no Supabase

### Problema: Falha na autenticação
- Verifique se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão corretas
- Verifique as configurações de CORS no Supabase

### Problema: Falha no envio de emails
- Verifique se a variável `SENDGRID_API_KEY` está correta
- Verifique o remetente autorizado nas configurações do SendGrid

## Suporte e Contato

Se precisar de ajuda, entre em contato pelo e-mail [seu-email@exemplo.com]