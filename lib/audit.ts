/**
 * Audit Log Utilities
 *
 * LGPD/Compliance: Registra todas as ações no sistema
 * Write-Once-Read-Many (WORM): Logs não podem ser modificados ou deletados
 */

import { prisma } from './db';
import { headers } from 'next/headers';

interface AuditLogParams {
  userId?: string;
  organizationId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  status?: 'success' | 'failed';
  reason?: string;
}

/**
 * Registra uma ação de auditoria
 * IMPORTANTE: Esta função NÃO usa runWithOrgContext pois
 * AuditLog precisa ser criado independentemente do contexto
 */
export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    // Obter informações da requisição
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') ||
      headersList.get('x-real-ip') ||
      'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Criar log de auditoria
    await prisma.auditLog.create({
      data: {
        organizationId: params.organizationId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldValues: params.oldValues || null,
        newValues: params.newValues || null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // CRÍTICO: Nunca deixar audit log quebrar a aplicação
    console.error('[AUDIT LOG ERROR]', error);
    // TODO: Enviar para serviço de monitoramento (Sentry)
  }
}

/**
 * Helper para logar criação de entidade
 */
export async function logCreate(params: {
  userId?: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  data: Record<string, any>;
}) {
  await logAudit({
    ...params,
    action: `CREATE_${params.entityType.toUpperCase()}`,
    newValues: params.data,
  });
}

/**
 * Helper para logar atualização de entidade
 */
export async function logUpdate(params: {
  userId?: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  oldData: Record<string, any>;
  newData: Record<string, any>;
}) {
  await logAudit({
    ...params,
    action: `UPDATE_${params.entityType.toUpperCase()}`,
    oldValues: params.oldData,
    newValues: params.newData,
  });
}

/**
 * Helper para logar deleção de entidade
 */
export async function logDelete(params: {
  userId?: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  data: Record<string, any>;
}) {
  await logAudit({
    ...params,
    action: `DELETE_${params.entityType.toUpperCase()}`,
    oldValues: params.data,
  });
}

/**
 * Buscar logs de auditoria de uma organização
 * Suporta filtros por usuário, entidade, data, etc.
 */
export async function getAuditLogs(params: {
  organizationId: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: any = {
    organizationId: params.organizationId,
  };

  if (params.userId) where.userId = params.userId;
  if (params.entityType) where.entityType = params.entityType;
  if (params.entityId) where.entityId = params.entityId;
  if (params.action) where.action = params.action;

  if (params.startDate || params.endDate) {
    where.createdAt = {};
    if (params.startDate) where.createdAt.gte = params.startDate;
    if (params.endDate) where.createdAt.lte = params.endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: params.limit || 50,
      skip: params.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page: Math.floor((params.offset || 0) / (params.limit || 50)) + 1,
    pageSize: params.limit || 50,
  };
}
