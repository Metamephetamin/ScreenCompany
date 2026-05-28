import Link from "next/link";
import { Check, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireCurrentUser } from "@/server/session";

const plans = [
  {
    name: "Free",
    price: "0 ₽",
    checks: "3 проверки",
    features: ["История проверок", "Web-отчет", "Сохранение отчета в PDF"],
    action: "Текущий тариф",
    href: null,
  },
  {
    name: "Pro",
    price: "2 900 ₽/мес",
    checks: "100 проверок в месяц",
    features: ["Риск-скоринг", "Рекомендации по сделке", "Сохранение отчета в PDF"],
    action: "Запросить счет",
    href: "mailto:billing@konturagent.ru?subject=Подключение%20Pro%20Контрагент%20Риск",
  },
  {
    name: "Business",
    price: "по запросу",
    checks: "Мониторинг списка компаний",
    features: ["События мониторинга", "Командный кабинет", "Интеграция оплаты после подключения CloudPayments"],
    action: "Обсудить условия",
    href: "mailto:billing@konturagent.ru?subject=Подключение%20Business%20Контрагент%20Риск",
  },
];

export default async function BillingPage() {
  await requireCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Тарифы</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Онлайн-оплата подключается. До подключения CloudPayments тарифы активируются вручную по счету.
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-3">
            <FileText className="mt-0.5 h-5 w-5 text-zinc-600" />
            <div>
              <div className="font-medium">Оплата для ООО и ИП</div>
              <div className="mt-1 text-sm text-zinc-500">
                Сейчас доступна заявка на счет. Эквайринг CloudPayments будет подключен после договора и ключей.
              </div>
            </div>
          </div>
          <Button asChild variant="secondary">
            <Link href="mailto:billing@konturagent.ru?subject=Счет%20на%20Контрагент%20Риск">
              Запросить счет
            </Link>
          </Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.name === "Pro" ? "border-zinc-900" : undefined}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="mt-3 text-3xl font-semibold">{plan.price}</div>
              <p className="text-sm text-zinc-500">{plan.checks}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-700" />
                    {feature}
                  </div>
                ))}
              </div>
              {plan.href ? (
                <Button asChild variant={plan.name === "Pro" ? "primary" : "secondary"} className="w-full">
                  <Link href={plan.href}>{plan.action}</Link>
                </Button>
              ) : (
                <Button variant="secondary" className="w-full" disabled>
                  {plan.action}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
