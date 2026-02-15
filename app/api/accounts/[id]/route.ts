import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validação para atualizar conta
const accountUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['CHECKING', 'SAVINGS', 'INVESTMENT', 'CREDIT_CARD', 'CASH']).optional(),
  balance: z.number().optional(),
  currency: z.string().optional(),
  institution: z.string().optional(),
  color: z.string().optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/accounts/[id]
 * Buscar conta específica
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const account = await prisma.account.findFirst({
      where: {
        id: params.id,
        organizationId: orgId,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Conta não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/accounts/[id]
 * Atualizar conta
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = accountUpdateSchema.parse(body);

    // Verificar se conta existe e pertence à organização
    const existingAccount = await prisma.account.findFirst({
      where: {
        id: params.id,
        organizationId: orgId,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Conta não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar conta
    const account = await prisma.account.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json({ account });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', message: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating account:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/accounts/[id]
 * Deletar conta (soft delete)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verificar se conta existe e pertence à organização
    const existingAccount = await prisma.account.findFirst({
      where: {
        id: params.id,
        organizationId: orgId,
      },
    });

    if (!existingAccount) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Conta não encontrada' },
        { status: 404 }
      );
    }

    // Soft delete: marcar como inativa ao invés de deletar
    const account = await prisma.account.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({
      message: 'Conta desativada com sucesso',
      account
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
