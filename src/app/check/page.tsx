import { Search } from "lucide-react";
import { CheckForm } from "@/components/app/check-form";
import { Disclaimer } from "@/components/app/disclaimer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function CheckPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Проверка контрагента</h1>
        <p className="mt-1 text-sm text-zinc-500">Введите ИНН или ОГРН компании/ИП, чтобы получить риск-отчет.</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Search className="h-5 w-5 text-zinc-600" />
          <CardTitle>Новая проверка</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckForm />
        </CardContent>
      </Card>
      <Disclaimer />
    </div>
  );
}
