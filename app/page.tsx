import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="z-10 max-w-3xl w-full items-center justify-center space-y-8">
        {/* Logo e Título */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Finly
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Planejamento Financeiro Inteligente
          </p>
        </div>

        {/* Descrição */}
        <div className="text-center space-y-2">
          <p className="text-base md:text-lg text-foreground/80">
            Gerencie suas finanças com IA, automação e estratégias comprovadas
          </p>
          <p className="text-sm text-muted-foreground">
            📊 Dashboards em tempo real • 🤖 Categorização automática • 📈 Planejamento 50/30/20
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-center"
          >
            Começar Grátis
          </Link>
          <Link
            href="/sign-in"
            className="w-full sm:w-auto px-8 py-3 border border-border bg-background text-foreground font-semibold rounded-lg hover:bg-muted/50 transition-colors text-center"
          >
            Já tenho conta
          </Link>
        </div>

        {/* Badge de custo */}
        <div className="text-center pt-4">
          <p className="text-xs text-muted-foreground">
            ✨ 100% gratuito para começar • Sem cartão de crédito
          </p>
        </div>
      </div>
    </main>
  );
}
