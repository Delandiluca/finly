import { OrganizationSwitcher, OrganizationList } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function SelectOrganizationPage() {
  const { userId, orgId } = await auth();

  // Se não estiver autenticado, redireciona para login
  if (!userId) {
    redirect('/sign-in');
  }

  // Se já tiver organização, redireciona para dashboard
  if (orgId) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="z-10 max-w-2xl w-full space-y-8">
        {/* Cabeçalho */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            Bem-vindo ao Finly! 🎉
          </h1>
          <p className="text-lg text-muted-foreground">
            Para começar, crie ou selecione uma organização
          </p>
        </div>

        {/* Componente de Organização do Clerk */}
        <div className="flex justify-center">
          <OrganizationList
            afterCreateOrganizationUrl="/dashboard"
            afterSelectOrganizationUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg",
              },
            }}
          />
        </div>

        {/* Informação adicional */}
        <div className="text-center text-sm text-muted-foreground">
          <p>💡 Você pode criar uma organização pessoal ou para sua família</p>
          <p className="mt-2">Exemplo: "Finanças Pessoais", "Família Silva", etc.</p>
        </div>
      </div>
    </div>
  );
}
