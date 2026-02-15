/**
 * Prisma Client com Multi-Tenancy Security
 *
 * Esta implementação usa Prisma Client Extensions para garantir
 * isolamento total entre organizações (multi-tenancy).
 *
 * CRÍTICO: Todas as queries automaticamente filtram por organizationId.
 */

import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

// ============================================
// CONTEXT MANAGEMENT (AsyncLocalStorage)
// ============================================

interface OrgContext {
  orgId: string;
  userId?: string;
}

const orgContext = new AsyncLocalStorage<OrgContext>();

/**
 * Obtém o organizationId do contexto atual
 * @throws Error se não houver contexto (security violation)
 */
export function getOrgIdFromContext(): string | null {
  return orgContext.getStore()?.orgId ?? null;
}

/**
 * Obtém o userId do contexto atual (opcional)
 */
export function getUserIdFromContext(): string | null {
  return orgContext.getStore()?.userId ?? null;
}

/**
 * Executa uma função dentro do contexto de uma organização
 * TODAS as queries Prisma dentro desta função serão filtradas por orgId
 */
export function runWithOrgContext<T>(
  orgId: string,
  fn: () => T,
  userId?: string
): T {
  return orgContext.run({ orgId, userId }, fn);
}

// ============================================
// PRISMA CLIENT WITH EXTENSIONS
// ============================================

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

  // Aplicar Extension para multi-tenancy
  return client.$extends({
    name: 'multi-tenancy',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // Pegar orgId do contexto
          const orgId = getOrgIdFromContext();

          // Organization model não precisa de filtro
          if (model === 'Organization') {
            return query(args);
          }

          // SECURITY: Bloquear queries sem contexto
          if (!orgId) {
            throw new Error(
              `[SECURITY VIOLATION] Tentativa de query no model "${model}" sem contexto de organização. ` +
              `Use runWithOrgContext() para definir o contexto.`
            );
          }

          // Injetar organizationId em TODAS as operações
          if (operation === 'findUnique' || operation === 'findFirst') {
            args.where = {
              ...args.where,
              organizationId: orgId,
            };
          }

          if (operation === 'findMany') {
            args.where = {
              ...args.where,
              organizationId: orgId,
            };
          }

          if (operation === 'create') {
            args.data = {
              ...args.data,
              organizationId: orgId,
            };
          }

          if (operation === 'createMany' && args.data) {
            // CreateMany pode ser array ou objeto único
            if (Array.isArray(args.data)) {
              args.data = args.data.map((item: any) => ({
                ...item,
                organizationId: orgId,
              }));
            } else {
              args.data = {
                ...args.data,
                organizationId: orgId,
              };
            }
          }

          if (operation === 'update' || operation === 'updateMany') {
            args.where = {
              ...args.where,
              organizationId: orgId,
            };
          }

          if (operation === 'delete' || operation === 'deleteMany') {
            args.where = {
              ...args.where,
              organizationId: orgId,
            };
          }

          if (operation === 'upsert') {
            args.where = {
              ...args.where,
              organizationId: orgId,
            };
            args.create = {
              ...args.create,
              organizationId: orgId,
            };
          }

          if (operation === 'count' || operation === 'aggregate') {
            args.where = {
              ...args.where,
              organizationId: orgId,
            };
          }

          return query(args);
        },
      },
    },
  });
};

// ============================================
// SINGLETON PATTERN
// ============================================

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Configura Row Level Security (RLS) no PostgreSQL
 * Define a variável de sessão app.current_org_id
 */
export async function setPostgresOrgContext(orgId: string) {
  await prisma.$executeRawUnsafe(
    `SET LOCAL app.current_org_id = '${orgId}'`
  );
}

/**
 * Executa operações dentro de uma transação PostgreSQL
 * com contexto de organização e RLS configurado
 */
export async function executeInTransaction<T>(
  orgId: string,
  fn: (tx: typeof prisma) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    // Configurar RLS (Row Level Security)
    await tx.$executeRawUnsafe(
      `SET LOCAL app.current_org_id = '${orgId}'`
    );

    // Executar operações dentro do contexto
    return await runWithOrgContext(orgId, () => fn(tx as typeof prisma));
  });
}
