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

    // Verificar se já existem categorias
    const existingCount = await prisma.category.count({
      where: { organizationId: orgId },
    });

    if (existingCount > 0) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Organização já possui categorias' },
        { status: 400 }
      );
    }

    // Criar categorias de despesa (usando ESSENTIAL como padrão)
    const expenseCategories = await prisma.category.createMany({
      data: DEFAULT_EXPENSE_CATEGORIES.map((cat) => ({
        ...cat,
        type: 'ESSENTIAL',
        organizationId: orgId,
      })),
    });

    // Criar categorias de receita
    const incomeCategories = await prisma.category.createMany({
      data: DEFAULT_INCOME_CATEGORIES.map((cat) => ({
        ...cat,
        type: 'INCOME',
        organizationId: orgId,
      })),
    });

    return NextResponse.json({
      message: 'Categorias padrão criadas com sucesso',
      created: {
        expenses: expenseCategories.count,
        incomes: incomeCategories.count,
      },
    });
  } catch (error) {
    console.error('Error seeding categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
