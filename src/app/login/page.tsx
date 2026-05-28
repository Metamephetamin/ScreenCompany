import { Building2 } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "@/components/app/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center">
          <CardTitle className="flex items-center justify-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-900 text-white">
            <Building2 className="h-5 w-5" />
            </span>
            <span>Контурагент Риск</span>
          </CardTitle>
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
