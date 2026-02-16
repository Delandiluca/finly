import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Categorias padrão para despesas
const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Alimentação', icon: '🍔', color: '#ef4444' },
  { name: 'Transporte', icon: '🚗', color: '#3b82f6' },
  { name: 'Moradia', icon: '🏠', color: '#8b5cf6' },
  { name: 'Saúde', icon: '💊', color: '#10b981' },
  { name: 'Educação', icon: '📚', color: '#f59e0b' },
  { name: 'Lazer', icon: '🎮', color: '#ec4899' },
  { name: 'Compras', icon: '🛍️', color: '#6366f1' },
  { name: 'Assinaturas', icon: '📺', color: '#14b8a6' },
  { name: 'Contas', icon: '📄', color: '#64748b' },
  { name: 'Outros', icon: '📦', color: '#94a3b8' },
];

// Categorias padrão para receitas
const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salário', icon: '💰', color: '#10b981' },
  { name: 'Freelance', icon: '💼', color: '#3b82f6' },
  { name: 'Investimentos', icon: '📈', color: '#8b5cf6' },
  { name: 'Vendas', icon: '🛒', color: '#f59e0b' },
  { name: 'Outros', icon: '💵', color: '#64748b' },
];

/**
 * POST /api/categories/seed
 * Criar categorias padrão para a organização
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Usar transaction para garantir que organização existe
    const result = await prisma.$transaction(async (tx) => {
      // PRIMEIRO: Garantir que a organização existe no banco
      await tx.organization.upsert({
        where: { id: orgId },
        create: {
          id: orgId,
          name: 'My Organization',
        },
        update: {},
      });

      // Verificar se já existem categorias
      const existingCount = await tx.category.count({
        where: { organizationId: orgId },
      });

      if (existingCount > 0) {
        throw new Error('Organização já possui categorias');
      }

      // Criar categorias de despesa (usando ESSENTIAL como padrão)
      const expenseCategories = await tx.category.createMany({
        data: DEFAULT_EXPENSE_CATEGORIES.map((cat) => ({
          ...cat,
          type: 'ESSENTIAL',
          organizationId: orgId,
        })),
      });

      // Criar categorias de receita
      const incomeCategories = await tx.category.createMany({
        data: DEFAULT_INCOME_CATEGORIES.map((cat) => ({
          ...cat,
          type: 'INCOME',
          organizationId: orgId,
        })),
      });

      return {
        expenses: expenseCategories.count,
        incomes: incomeCategories.count,
      };
    });

    return NextResponse.json({
      message: 'Categorias padrão criadas com sucesso',
      created: result,
    });
  } catch (error) {
    console.error('Error seeding categories:', error);

    // Tratar erro específico de categorias existentes
    if (error instanceof Error && error.message === 'Organização já possui categorias') {
      return NextResponse.json(
        { error: 'Bad Request', message: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
