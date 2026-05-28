import { CheckCircle2, CircleDashed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentUser } from "@/server/session";

export const dynamic = "force-dynamic";

const integrations = [
  {
    name: "DaData API",
    description: "Карточка компании по ИНН/ОГРН",
    connected: Boolean(process.env.DADATA_API_KEY),
  },
  {
    name: "DaMIA API-ФССП",
    description: "Исполнительные производства",
    connected: Boolean(process.env.DAMIA_FSSP_API_KEY),
  },
  {
    name: "CloudPayments",
    description: "Онлайн-оплата и подписки",
    connected: Boolean(process.env.CLOUDPAYMENTS_PUBLIC_ID && process.env.CLOUDPAYMENTS_API_SECRET),
  },
  {
    name: "Арбитражный API",
    description: "Судебные дела и изменения по делам",
    connected: false,
  },
  {
    name: "ГИР БО / финансы",
    description: "Выручка, прибыль и динамика отчетности",
    connected: false,
  },
  {
    name: "Федресурс",
    description: "Банкротства и существенные сообщения",
    connected: false,
  },
];

export default async function SettingsPage() {
  const user = await requireCurrentUser();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Настройки</h1>
        <p className="mt-1 text-sm text-zinc-500">Состояние аккаунта и подключенных источников.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Профиль</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <Field label="Email" value={user?.email ?? "Гость"} />
          <Field label="Имя" value={user?.name ?? "Не указано"} />
          <Field label="Тип кабинета" value="B2B SaaS" />
          <Field label="Смена данных" value="Через поддержку до подключения командных аккаунтов" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Интеграции данных</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          {integrations.map((item) => (
            <div key={item.name} className="rounded-md border border-zinc-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium">{item.name}</div>
                {item.connected ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Подключено
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600">
                    <CircleDashed className="h-3.5 w-3.5" />
                    Не подключено
                  </span>
                )}
              </div>
              <div className="mt-2 text-zinc-500">{item.description}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-zinc-200 p-3">
      <div className="text-xs uppercase text-zinc-500">{label}</div>
      <div className="mt-1 font-medium text-zinc-900">{value}</div>
    </div>
  );
}
