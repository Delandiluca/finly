import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validação para criar/atualizar conta
const accountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100),
  type: z.enum(['CHECKING', 'SAVINGS', 'INVESTMENT', 'CREDIT_CARD', 'CASH']),
  initialBalance: z.number().optional().default(0), // Saldo inicial para criar transação
  currency: z.string().default('BRL'),
  institution: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().default(true),
});

/**
 * GET /api/accounts
 * Listar todas as contas da organização
 */
export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Usuário não autenticado ou sem organização' },
        { status: 401 }
      );
    }

    // Buscar contas da organização
    const accounts = await prisma.account.findMany({
      where: {
        organizationId: orgId,
      },
      orderBy: [
        { isActive: 'desc' }, // Ativas primeiro
        { name: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        type: true,
        currency: true,
        institution: true,
        color: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Erro ao buscar contas' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accounts
 * Criar nova conta
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Usuário não autenticado ou sem organização' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validar dados
    const validatedData = accountSchema.parse(body);
    const { initialBalance, ...accountData } = validatedData;

    // Criar conta e transação inicial se houver saldo
    const result = await prisma.$transaction(async (tx) => {
      // Criar conta
      const account = await tx.account.create({
        data: {
          ...accountData,
          organizationId: orgId,
          createdBy: userId,
        },
      });

      // Se houver saldo inicial, criar transação de INCOME
      if (initialBalance && initialBalance !== 0) {
        await tx.transaction.create({
          data: {
            organizationId: orgId,
            accountId: account.id,
            type: 'INCOME',
            amountCents: BigInt(initialBalance),
            currency: account.currency,
            description: 'Saldo inicial',
            date: new Date(),
            status: 'COMPLETED',
            createdBy: userId,
          },
        });
      }

      return account;
    });

    return NextResponse.json({ account: result }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', message: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Erro ao criar conta' },
      { status: 500 }
    );
  }
}
