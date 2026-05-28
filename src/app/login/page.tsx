import { Building2 } from "lucide-react";
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
          <p className="text-sm text-zinc-500">Демо: demo@risk.local / password123</p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
