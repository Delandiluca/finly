# Finly - SaaS de Planejamento Financeiro

Sistema completo de gestão financeira pessoal com IA, dashboards em tempo real, importação automática e planejamento baseado em estratégias comprovadas (50/30/20).

## 🚀 Features

- 💰 **Gestão Multi-Contas**: Bancos, cartões de crédito, poupança
- 📊 **Dashboards em Tempo Real**: Visualize seus gastos e receitas
- 🤖 **Categorização Automática com IA**: GPT-4o-mini para classificar transações
- 📱 **Multi-Tenant**: Suporte para múltiplas organizações com isolamento total
- 📄 **Importação de Dados**: CSV, OFX (PDF em desenvolvimento)
- 📈 **Estratégias de Planejamento**: 50/30/20 e orçamentos customizados
- 🔒 **Segurança de Produção**: Row Level Security + Prisma Extensions
- 📤 **Exportação para Excel**: Relatórios completos com fórmulas

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, tRPC
- **Database**: PostgreSQL (Neon.tech), Prisma ORM
- **Auth**: Clerk (com suporte a MFA)
- **IA**: OpenAI API (GPT-4o-mini)
- **Cache**: Upstash Redis
- **Storage**: Vercel Blob
- **Monitoring**: Sentry

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Neon PostgreSQL (grátis)
- Conta Clerk (grátis)
- Conta OpenAI (opcional para IA)

## ⚡ Quick Start

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/finly.git
cd finly
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` e preencha as variáveis:

```env
# Database - Obtenha em https://neon.tech
DATABASE_URL="postgresql://user:password@host:5432/finly"

# Clerk - Obtenha em https://clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# OpenAI (opcional) - Obtenha em https://platform.openai.com
OPENAI_API_KEY="sk-..."

# Redis (opcional) - Obtenha em https://upstash.com
UPSTASH_REDIS_URL="https://..."
UPSTASH_REDIS_TOKEN="..."

# Encryption - Gere com: openssl rand -hex 32
ENCRYPTION_KEY="..."

# Cron Secret - Gere uma string aleatória
CRON_SECRET="..."
```

### 4. Setup do Banco de Dados

```bash
# Executar migrations
npx prisma migrate dev

# (Opcional) Seed com dados iniciais
npx prisma db seed
```

### 5. Execute o servidor de desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **organizations**: Organizações (multi-tenant)
- **accounts**: Contas bancárias e cartões
- **categories**: Categorias de transações (padrão + custom)
- **transactions**: Transações financeiras
- **budgets**: Orçamentos mensais/anuais
- **financial_goals**: Metas financeiras
- **import_jobs**: Jobs de importação assíncrona
- **audit_logs**: Logs de auditoria (WORM - Write-Once-Read-Many)

### Segurança Multi-Tenant

O sistema implementa **3 camadas de isolamento**:

1. **Prisma Client Extensions**: Injeta automaticamente `organizationId` em todas as queries
2. **Row Level Security (RLS)**: Políticas no PostgreSQL bloqueiam acesso cross-tenant
3. **Middleware Next.js**: Valida rotas e organizações

## 📂 Estrutura de Pastas

```
finly/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   ├── (dashboard)/       # Rotas protegidas
│   │   ├── dashboard/
│   │   ├── accounts/
│   │   ├── transactions/
│   │   └── budgets/
│   └── api/               # API Routes
├── components/
│   ├── ui/                # shadcn/ui components
│   └── dashboard/         # Dashboard widgets
├── lib/
│   ├── db.ts              # Prisma client + Extensions
│   ├── auth.ts            # Clerk helpers
│   ├── audit.ts           # Audit log functions
│   └── ai/                # OpenAI integrations
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── migrations/        # Database migrations
└── middleware.ts          # Route protection
```

## 🔐 Segurança

### Row Level Security (RLS)

Todas as tabelas multi-tenant têm RLS ativado:

```sql
-- Exemplo: Transactions
CREATE POLICY tenant_isolation_transactions ON transactions
  USING (organization_id = current_setting('app.current_org_id')::text);
```

### Audit Logs (LGPD Compliance)

Todos os eventos críticos são registrados:

```typescript
import { logCreate, logUpdate, logDelete } from '@/lib/audit';

// Exemplo: Criar transação
await logCreate({
  userId: session.userId,
  organizationId: session.orgId,
  entityType: 'transaction',
  entityId: transaction.id,
  data: transaction,
});
```

### Valores Monetários

❌ **NUNCA use float/double para dinheiro!**

✅ **Sempre use BigInt (centavos)**:

```typescript
// Armazenar
const amountCents = BigInt(Math.round(100.50 * 100)); // 10050

// Exibir
const formatted = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
}).format(Number(amountCents) / 100);
```

## 🧪 Testes

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📊 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm run db:migrate   # Executar migrations
npm run db:seed      # Seed do banco
npm run db:studio    # Prisma Studio (visualizar dados)
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Push para GitHub
2. Importe no Vercel
3. Configure as variáveis de ambiente
4. Deploy automático!

```bash
# Ou via CLI
vercel --prod
```

### Configurar Webhooks

- **Clerk**: `https://seu-dominio.vercel.app/api/webhooks/clerk`
- **WhatsApp** (futuro): `https://seu-dominio.vercel.app/api/webhooks/whatsapp`

## 📝 Desenvolvimento

### Adicionar Nova Feature

1. Criar branch: `git checkout -b feat/minha-feature`
2. Implementar feature
3. Adicionar testes
4. Commit: `git commit -m 'feat: adicionar X'`
5. Push: `git push origin feat/minha-feature`
6. Abrir Pull Request

### Padrões de Código

- **TypeScript**: Sempre tipar retornos de funções
- **React**: Server Components por padrão, Client Components apenas quando necessário
- **Validação**: Usar Zod para validação em runtime
- **Commits**: Seguir Conventional Commits

### Migrations

```bash
# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, leia o [CONTRIBUTING.md](CONTRIBUTING.md) antes de enviar PRs.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- **Documentação**: [docs.finly.app](https://docs.finly.app)
- **Discord**: [discord.gg/finly](https://discord.gg/finly)
- **Email**: suporte@finly.app

## 🗺️ Roadmap

- [x] Fase 1: Fundação (Autenticação, Database, Multi-tenant)
- [ ] Fase 2: Features Core (Contas, Transações, Categorias)
- [ ] Fase 3: Dashboard & Visualizações
- [ ] Fase 4: Planejamento Financeiro (50/30/20, Orçamentos)
- [ ] Fase 5: Importação (CSV, OFX)
- [ ] Fase 6: IA & Categorização Automática
- [ ] Fase 7: WhatsApp Bot
- [ ] Fase 8: Exportação para Excel
- [ ] Fase 9: PDF Parsing com LLM
- [ ] Fase 10: Open Finance Integration

## 📈 Performance

- **Dashboard**: < 500ms
- **API Response**: < 200ms
- **Database Queries**: Materialized Views + Redis Cache
- **Bundle Size**: < 200KB (gzip)

## 🔧 Troubleshooting

### Erro: "Unauthorized: No organization context"

**Solução**: Certifique-se de que o usuário selecionou uma organização no Clerk.

### Erro: "P2002: Unique constraint failed"

**Solução**: Conflito de dados. Verifique se já existe registro com mesmo identificador.

### Slow Dashboard

**Solução**: Execute `npm run db:refresh-views` para atualizar Materialized Views.

## 🎯 Metas de Custo

- **MVP**: $0-10/mês
  - Neon PostgreSQL: $0 (free tier)
  - Vercel: $0 (hobby plan)
  - Clerk: $0 (10k MAU)
  - OpenAI: ~$5-10/mês

- **Scale (1000+ usuários)**: ~$60-70/mês
  - Neon Scale: $19/mês
  - Vercel Pro: $20/mês
  - Upstash Pro: $10/mês
  - OpenAI: ~$20/mês

---

**Desenvolvido com ❤️ usando Next.js 15 e IA**
