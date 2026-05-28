import Link from "next/link";
import { AlertTriangle, Building2, Clock, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/app/risk-badge";
import { Disclaimer } from "@/components/app/disclaimer";
import { HistoryTable } from "@/components/app/history-table";
import { getCompanyBundle } from "@/server/riskEngine";
import { getHistory, getMonitoringList } from "@/server/store";
import type { CompanyCheckResult } from "@/lib/types";
import { requireCurrentUser } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  const userId = user.id;
  const history = await getHistory(userId);
  const monitoring = await getMonitoringList(userId);
  const highRiskHistory = history.filter((item) => item.riskLevel === "high").slice(0, 3);
  const highRiskBundles = (
    await Promise.all(highRiskHistory.map((item) => getCompanyBundle(item.companyId)))
  ).filter((item): item is CompanyCheckResult => Boolean(item));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Дашборд проверок</h1>
          <p className="mt-1 text-sm text-zinc-500">Операционная панель риска перед авансом, отсрочкой и договором.</p>
        </div>
        <Button asChild>
          <Link href="/check">Новая проверка</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={Clock} label="Проверок" value={String(history.length)} />
        <Metric icon={ShieldCheck} label="В мониторинге" value={String(monitoring.length)} />
        <Metric icon={AlertTriangle} label="Высокий риск" value={String(highRiskHistory.length)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Последние высокорисковые компании</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {highRiskBundles.map((item) => (
              <Link
                key={item.company.id}
                href={`/company/${item.company.id}`}
                className="block rounded-md border border-zinc-200 p-3 hover:bg-zinc-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{item.company.name}</div>
                    <div className="mt-1 text-xs text-zinc-500">ИНН {item.company.inn}</div>
                  </div>
                  <RiskBadge level={item.risk.level} />
                </div>
              </Link>
            ))}
            {highRiskBundles.length === 0 && (
              <p className="text-sm text-zinc-500">Высокорисковых проверок пока нет.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Последние проверки</CardTitle>
          </CardHeader>
          <CardContent>
            <HistoryTable items={history.slice(0, 12)} />
          </CardContent>
        </Card>
      </div>
      <Disclaimer />
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <div className="text-sm text-zinc-500">{label}</div>
          <div className="mt-1 text-3xl font-semibold">{value}</div>
        </div>
        <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
          <Icon className="h-5 w-5 text-zinc-600" />
        </div>
      </CardContent>
    </Card>
  );
}
