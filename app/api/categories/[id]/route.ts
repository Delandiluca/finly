import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const categoryUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
});

/**
 * PUT /api/categories/[id]
 * Atualizar categoria
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
    const validatedData = categoryUpdateSchema.parse(body);

    const existing = await prisma.category.findFirst({
      where: {
        id: params.id,
        organizationId: orgId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json({ category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', message: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/categories/[id]
 * Desativar categoria
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

    const existing = await prisma.category.findFirst({
      where: {
        id: params.id,
        organizationId: orgId,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    // Soft delete
    const category = await prisma.category.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({
      message: 'Categoria desativada com sucesso',
      category,
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
