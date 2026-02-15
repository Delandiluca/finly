import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validação
const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.number().positive(),
  accountId: z.string(),
  categoryId: z.string().optional(),
  toAccountId: z.string().optional(), // Para transferências
  description: z.string().optional(),
  date: z.string().datetime(),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * GET /api/transactions
 * Listar transações com filtros
 */
export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const accountId = searchParams.get('accountId');
    const categoryId = searchParams.get('categoryId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const transactions = await prisma.transaction.findMany({
      where: {
        organizationId: orgId,
        ...(type && { type: type as 'INCOME' | 'EXPENSE' | 'TRANSFER' }),
        ...(accountId && { accountId }),
        ...(categoryId && { categoryId }),
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
      include: {
        account: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
          },
        },
        toAccount: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    });

    // Contar total para paginação
    const total = await prisma.transaction.count({
      where: {
        organizationId: orgId,
        ...(type && { type: type as 'INCOME' | 'EXPENSE' | 'TRANSFER' }),
        ...(accountId && { accountId }),
        ...(categoryId && { categoryId }),
      },
    });

    return NextResponse.json({
      transactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/transactions
 * Criar nova transação
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = transactionSchema.parse(body);

    // Converter amount para centavos (BigInt)
    const amountInCents = BigInt(Math.round(validatedData.amount * 100));

    // Validações específicas
    if (validatedData.type === 'TRANSFER' && !validatedData.toAccountId) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Transferências requerem conta de destino' },
        { status: 400 }
      );
    }

    // Verificar se conta pertence à organização
    const account = await prisma.account.findFirst({
      where: {
        id: validatedData.accountId,
        organizationId: orgId,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Conta não encontrada' },
        { status: 404 }
      );
    }

    // Iniciar transação do banco de dados
    const result = await prisma.$transaction(async (tx) => {
      // Criar transação
      const transaction = await tx.transaction.create({
        data: {
          type: validatedData.type,
          amount: amountInCents,
          accountId: validatedData.accountId,
          categoryId: validatedData.categoryId,
          toAccountId: validatedData.toAccountId,
          description: validatedData.description,
          date: new Date(validatedData.date),
          isRecurring: validatedData.isRecurring,
          recurringInterval: validatedData.recurringInterval,
          tags: validatedData.tags || [],
          organizationId: orgId,
          createdBy: userId,
        },
        include: {
          account: true,
          category: true,
          toAccount: true,
        },
      });

      // Atualizar saldo da conta origem
      if (validatedData.type === 'EXPENSE' || validatedData.type === 'TRANSFER') {
        await tx.account.update({
          where: { id: validatedData.accountId },
          data: { balance: { decrement: amountInCents } },
        });
      } else if (validatedData.type === 'INCOME') {
        await tx.account.update({
          where: { id: validatedData.accountId },
          data: { balance: { increment: amountInCents } },
        });
      }

      // Atualizar saldo da conta destino (transferência)
      if (validatedData.type === 'TRANSFER' && validatedData.toAccountId) {
        await tx.account.update({
          where: { id: validatedData.toAccountId },
          data: { balance: { increment: amountInCents } },
        });
      }

      return transaction;
    });

    return NextResponse.json({ transaction: result }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', message: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
