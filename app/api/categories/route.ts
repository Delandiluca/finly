import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validação
const categorySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
});

/**
 * GET /api/categories
 * Listar categorias da organização
 */
export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // Filtrar por tipo (INCOME ou EXPENSE)

    const categories = await prisma.category.findMany({
      where: {
        organizationId: orgId,
        ...(type && { type: type as 'INCOME' | 'EXPENSE' }),
      },
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * POST /api/categories
 * Criar nova categoria
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = categorySchema.parse(body);

    // Verificar se já existe categoria com mesmo nome
    const existing = await prisma.category.findFirst({
      where: {
        organizationId: orgId,
        name: validatedData.name,
        type: validatedData.type,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Já existe uma categoria com este nome' },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        ...validatedData,
        organizationId: orgId,
        createdBy: userId,
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', message: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
