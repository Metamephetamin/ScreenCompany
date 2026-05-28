import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Настройки</h1>
        <p className="mt-1 text-sm text-zinc-500">Личный кабинет, уведомления и подготовка интеграций.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Профиль</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <label className="block space-y-1 text-sm font-medium">
            Email
            <Input defaultValue="demo@risk.local" />
          </label>
          <label className="block space-y-1 text-sm font-medium">
            Компания
            <Input defaultValue="ООО Покупатель" />
          </label>
          <Button>Сохранить</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Интеграции данных</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          {["DaData API", "ФНС / ЕГРЮЛ", "Арбитражный API-провайдер", "ГИР БО", "ФССП API-провайдер", "Федресурс"].map((item) => (
            <div key={item} className="rounded-md border border-zinc-200 p-3">
              <div className="font-medium">{item}</div>
              <div className="mt-1 text-zinc-500">Готово к подключению через provider abstraction.</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
