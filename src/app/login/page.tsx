import { Building2 } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "@/components/app/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-zinc-900 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <CardTitle>Личный кабинет</CardTitle>
          <p className="text-sm text-zinc-500">Войдите или создайте аккаунт для проверки контрагентов.</p>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-5 flex flex-wrap gap-3 text-xs text-zinc-500">
            <Link href="/offer" className="hover:text-zinc-900">Оферта</Link>
            <Link href="/privacy" className="hover:text-zinc-900">Конфиденциальность</Link>
            <Link href="/personal-data" className="hover:text-zinc-900">Персональные данные</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
