import { UserButton, OrganizationSwitcher } from '@clerk/nextjs';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Finly
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/accounts"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Contas
            </Link>
            <Link
              href="/transactions"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Transações
            </Link>
            <Link
              href="/budgets"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Orçamentos
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <OrganizationSwitcher
              appearance={{
                elements: {
                  rootBox: "flex items-center",
                },
              }}
            />
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
