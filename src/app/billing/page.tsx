import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const plans = [
  { name: "Free", price: "0 ₽", checks: "3 проверки", features: ["История проверок", "Web-отчет", "PDF экспорт"] },
  { name: "Pro", price: "2 900 ₽/мес", checks: "100 проверок в месяц", features: ["Риск-скоринг", "Рекомендации по сделке", "Экспорт PDF"] },
  { name: "Business", price: "по запросу", checks: "Мониторинг списка компаний", features: ["События мониторинга", "Командный кабинет", "Подготовка под ЮKassa/Stripe"] },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Тарифы</h1>
        <p className="mt-1 text-sm text-zinc-500">Платежи в MVP моковые, архитектура подготовлена под Stripe или ЮKassa.</p>
      </div>
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
              <Button variant={plan.name === "Pro" ? "primary" : "secondary"} className="w-full">
                Выбрать тариф
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
