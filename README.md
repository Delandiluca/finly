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

- **Docker** + **VS Code** com a extensão Dev Containers (caminho recomendado — traz Node e
  PostgreSQL prontos)
- Uma conta **Clerk** (grátis) — é o único serviço sem equivalente local
- Contas OpenAI / Upstash / Vercel Blob são opcionais para desenvolvimento

## ⚡ Quick Start (devcontainer)

1. Clone o repositório e abra no VS Code
2. **Reopen in Container** — o `.devcontainer/post-create.sh` instala as dependências, gera o
   Prisma Client, sincroniza o schema com o Postgres local e cria o `.env.local`
3. Preencha as chaves do Clerk em `.env.local`
4. `npm run dev` → http://localhost:5010

### Portas

O esquema é determinístico (`5` + serviço), para que finly conviva com os repositórios irmãos
(`fourmdg` em 4xxx, `product-metrics` em 3000):

| Porta | Serviço |
|-------|---------|
| 5010 | Next.js dev server |
| 5030 | PostgreSQL (`postgres` / `finly_development`) |
| 5080 | Playwright HTML report |
| 5090 | Playwright UI mode |

### Sem devcontainer

Precisa de Node 20 (veja `.nvmrc`) e de um PostgreSQL acessível:

```bash
npm install
export DATABASE_URL="postgresql://user:senha@localhost:5432/finly_development"
npx prisma generate && npx prisma db push
cp .env.example .env.local   # preencha as chaves do Clerk
npm run dev
```

> **Antes de contribuir, leia [AGENTS.md](AGENTS.md)** — é o acordo de trabalho do repositório
> (invariantes de multi-tenancy, política de fallback, gates de validação) e traz o **ledger de
> dívida técnica**, incluindo o fato de que a árvore **ainda não compila**.

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

A suíte E2E (Playwright) é um gate **local**, não de CI: ela precisa de credenciais Clerk reais e
de um banco populado, que a CI não tem como fornecer.

```bash
npm run test         # roda a suíte (sobe o dev server sozinho)
npm run test:ui      # modo interativo
npm run test:report  # abre o último relatório
```

## 📊 Scripts Disponíveis

```bash
npm run dev                  # Servidor de desenvolvimento (porta 5010)
npm run build                # Build de produção
npm run start                # Servidor de produção
npm run validate             # O gate: ratchet de typecheck (o que a CI exige)
npm run typecheck            # tsc puro — mostra todos os erros conhecidos
npm run typecheck:baseline   # Registra o progresso após corrigir erros
npm run lint                 # ESLint (informativo, não é gate)
npm run test                 # Playwright E2E (precisa das chaves Clerk e do app rodando)
npm run db:migrate           # Criar/aplicar migrations
npm run db:push              # Sincronizar schema (dev descartável)
npm run db:studio            # Prisma Studio
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
