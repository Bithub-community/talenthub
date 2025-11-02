import Link from "next/link";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-semibold">
            HR Manager
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
              Yönetim Paneli
            </Link>
            <Link href="/applications/new" className="text-sm font-medium hover:text-primary">
              Yeni Başvuru
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">Panel</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}