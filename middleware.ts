/**
 * Next.js Middleware for Route Protection
 *
 * Este middleware garante:
 * 1. Autenticação via Clerk
 * 2. Validação de organizationId nas rotas
 * 3. Redirecionamento automático para login
 */

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Rotas protegidas que requerem autenticação
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/accounts(.*)',
  '/transactions(.*)',
  '/budgets(.*)',
  '/goals(.*)',
  '/settings(.*)',
  '/api/accounts(.*)',
  '/api/transactions(.*)',
  '/api/budgets(.*)',
  '/api/import(.*)',
]);

// Rotas públicas (não requerem autenticação)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/select-organization',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth();

  // NOVO: Redirecionar usuários autenticados da landing page
  if (req.nextUrl.pathname === '/' && userId) {
    // Se tem organização, vai pro dashboard
    if (orgId) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // Se não tem organização, vai selecionar/criar uma
    return NextResponse.redirect(new URL('/select-organization', req.url));
  }

  // NOVO: Redirecionar usuários autenticados das páginas de auth
  if ((req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up')) && userId) {
    // Se tem organização, vai pro dashboard
    if (orgId) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // Se não tem organização, vai selecionar/criar uma
    return NextResponse.redirect(new URL('/select-organization', req.url));
  }

  // Se for rota pública, permitir acesso
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Se for rota protegida, verificar autenticação
  if (isProtectedRoute(req)) {
    // 1. Verificar se está autenticado
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // 2. Verificar se tem organização selecionada
    if (!orgId && req.nextUrl.pathname.startsWith('/dashboard')) {
      // TODO: Redirecionar para seleção/criação de organização
      return NextResponse.redirect(new URL('/select-organization', req.url));
    }

    // 3. Validar orgId na URL vs orgId do usuário (para rotas com [orgId])
    const pathSegments = req.nextUrl.pathname.split('/');
    const pathOrgId = pathSegments[2]; // /dashboard/[orgId]/...

    if (
      pathOrgId &&
      pathOrgId !== 'create' &&
      pathOrgId !== orgId
    ) {
      // Security: Tentativa de acessar org diferente
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You do not have access to this organization',
        },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
