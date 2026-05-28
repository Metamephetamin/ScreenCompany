import Link from "next/link";
import { Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/app/risk-badge";
import { companyDataProvider } from "@/server/providers/mockProviders";
import { getMonitoringList } from "@/server/store";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MonitoringPage() {
  const items = await Promise.all(
    getMonitoringList().map(async (item) => ({
      item,
      company: await companyDataProvider.findById(item.companyId),
    })),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Мониторинг</h1>
          <p className="mt-1 text-sm text-zinc-500">Компании, по которым отслеживаются новые публичные события.</p>
        </div>
        <Button asChild><Link href="/check">Добавить компанию</Link></Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Bell className="h-5 w-5 text-zinc-600" />
          <CardTitle>Список мониторинга</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-zinc-500">Пока нет компаний в мониторинге. Откройте карточку компании и включите отслеживание.</p>
          ) : (
            items.map(({ item, company }) => (
              <div key={item.companyId} className="rounded-md border border-zinc-200 p-4">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <Link href={`/company/${item.companyId}`} className="font-medium hover:underline">
                      {company?.name ?? item.companyId}
                    </Link>
                    <div className="mt-1 text-xs text-zinc-500">Добавлено {item.addedAt ? formatDate(item.addedAt) : "нет данных"}</div>
                  </div>
                  <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
                    {item.status}
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {item.events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between gap-3 rounded-md bg-zinc-50 px-3 py-2 text-sm">
                      <span>{event.title}</span>
                      <RiskBadge level={event.severity} />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
