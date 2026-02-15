import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Link de volta para home */}
      <div className="absolute top-8 left-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
        >
          ← Voltar
        </Link>
      </div>

      {/* Conteúdo da página de auth */}
      {children}
    </div>
  );
}
