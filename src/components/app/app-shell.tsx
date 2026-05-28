import Link from "next/link";
import { BarChart3, Building2, CreditCard, History, Search, Settings, ShieldCheck, ShieldUser } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Дашборд", icon: BarChart3 },
  { href: "/check", label: "Проверка", icon: Search },
  { href: "/monitoring", label: "Мониторинг", icon: ShieldCheck },
  { href: "/billing", label: "Тарифы", icon: CreditCard },
  { href: "/settings", label: "Настройки", icon: Settings },
  { href: "/admin", label: "Админка", icon: ShieldUser },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-200 bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-900 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold">Контурагент Риск</div>
            <div className="text-xs text-zinc-500">B2B проверка сделок</div>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-zinc-200 p-3 text-xs text-zinc-500">
          <div className="grid gap-1">
            <Link href="/offer" className="hover:text-zinc-900">Оферта</Link>
            <Link href="/privacy" className="hover:text-zinc-900">Конфиденциальность</Link>
            <Link href="/personal-data" className="hover:text-zinc-900">Персональные данные</Link>
          </div>
        </div>
      </aside>
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 lg:ml-64">
        <div className="flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold lg:hidden">
            <Building2 className="h-5 w-5" />
            Контурагент Риск
          </Link>
          <div className="hidden items-center gap-2 text-sm text-zinc-500 lg:flex">
            <History className="h-4 w-4" />
            Проверки по открытым источникам
          </div>
          <Link href="/login" className="text-sm font-medium text-zinc-700 hover:text-zinc-950">
            Личный кабинет
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-zinc-100 px-3 py-2 lg:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
