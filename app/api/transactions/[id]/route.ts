import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const transactionUpdateSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']).optional(),
  amount: z.number().positive().optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  toAccountId: z.string().optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

/**
 * GET /api/transactions/[id]
 * Buscar transação específica
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        organizationId: orgId,
      },
      include: {
        account: true,
        category: true,
        toAccount: true,
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT /api/transactions/[id]
 * Atualizar transação
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = transactionUpdateSchema.parse(body);

    // Buscar transação existente
    const existing = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        organizationId: orgId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    // Se está alterando o valor, precisa reverter o saldo antigo e aplicar o novo
    const result = await prisma.$transaction(async (tx) => {
      let amountInCents: bigint | undefined;

      if (validatedData.amount) {
        amountInCents = BigInt(Math.round(validatedData.amount * 100));

        // Reverter saldo antigo
        if (existing.type === 'EXPENSE' || existing.type === 'TRANSFER') {
          await tx.account.update({
            where: { id: existing.accountId },
            data: { balance: { increment: existing.amount } },
          });
        } else if (existing.type === 'INCOME') {
          await tx.account.update({
            where: { id: existing.accountId },
            data: { balance: { decrement: existing.amount } },
          });
        }

        if (existing.type === 'TRANSFER' && existing.toAccountId) {
          await tx.account.update({
            where: { id: existing.toAccountId },
            data: { balance: { decrement: existing.amount } },
          });
        }

        // Aplicar novo saldo
        const newType = validatedData.type || existing.type;
        const newAccountId = validatedData.accountId || existing.accountId;

        if (newType === 'EXPENSE' || newType === 'TRANSFER') {
          await tx.account.update({
            where: { id: newAccountId },
            data: { balance: { decrement: amountInCents } },
          });
        } else if (newType === 'INCOME') {
          await tx.account.update({
            where: { id: newAccountId },
            data: { balance: { increment: amountInCents } },
          });
        }

        if (newType === 'TRANSFER' && validatedData.toAccountId) {
          await tx.account.update({
            where: { id: validatedData.toAccountId },
            data: { balance: { increment: amountInCents } },
          });
        }
      }

      // Atualizar transação
      const transaction = await tx.transaction.update({
        where: { id: params.id },
        data: {
          ...(validatedData.type && { type: validatedData.type }),
          ...(amountInCents && { amount: amountInCents }),
          ...(validatedData.accountId && { accountId: validatedData.accountId }),
          ...(validatedData.categoryId !== undefined && { categoryId: validatedData.categoryId }),
          ...(validatedData.toAccountId !== undefined && { toAccountId: validatedData.toAccountId }),
          ...(validatedData.description !== undefined && { description: validatedData.description }),
          ...(validatedData.date && { date: new Date(validatedData.date) }),
          ...(validatedData.tags && { tags: validatedData.tags }),
        },
        include: {
          account: true,
          category: true,
          toAccount: true,
        },
      });

      return transaction;
    });

    return NextResponse.json({ transaction: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', message: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/transactions/[id]
 * Deletar transação e reverter saldo
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        organizationId: orgId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    // Deletar e reverter saldo
    await prisma.$transaction(async (tx) => {
      // Reverter saldo
      if (existing.type === 'EXPENSE' || existing.type === 'TRANSFER') {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: existing.amount } },
        });
      } else if (existing.type === 'INCOME') {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { decrement: existing.amount } },
        });
      }

      if (existing.type === 'TRANSFER' && existing.toAccountId) {
        await tx.account.update({
          where: { id: existing.toAccountId },
          data: { balance: { decrement: existing.amount } },
        });
      }

      // Deletar transação
      await tx.transaction.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({
      message: 'Transação deletada com sucesso',
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
