import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, FileText, Landmark, ShieldCheck } from "lucide-react";
import { Disclaimer } from "@/components/app/disclaimer";
import { FinanceChart } from "@/components/app/finance-chart";
import { MonitoringToggle } from "@/components/app/monitoring-toggle";
import { ReportActions } from "@/components/app/report-actions";
import { RiskBadge } from "@/components/app/risk-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatMoney } from "@/lib/utils";
import { getCompanyBundle } from "@/server/riskEngine";
import { getMonitoring } from "@/server/store";

export default async function CompanyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ report?: string }>;
}) {
  const { id } = await params;
  const { report } = await searchParams;
  const bundle = await getCompanyBundle(id);
  if (!bundle) notFound();
  const monitoring = getMonitoring(id);
  const reportId = report ?? bundle.report.id;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <RiskBadge level={bundle.risk.level} />
              <Badge className="border-zinc-200 bg-zinc-50 text-zinc-700">{bundle.company.status}</Badge>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">{bundle.company.name}</h1>
            <p className="mt-2 text-sm text-zinc-500">
              ИНН {bundle.company.inn} · ОГРН {bundle.company.ogrn}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <MonitoringToggle companyId={id} initial={monitoring} />
            <Button asChild variant="secondary">
              <Link href={`/reports/${reportId}`}>Открыть отчет</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="flex w-full overflow-x-auto">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="risks">Риски</TabsTrigger>
          <TabsTrigger value="courts">Суды</TabsTrigger>
          <TabsTrigger value="finance">Финансы</TabsTrigger>
          <TabsTrigger value="monitoring">Мониторинг</TabsTrigger>
          <TabsTrigger value="sources">Источники</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
            <Card>
              <CardHeader><CardTitle>Карточка компании</CardTitle></CardHeader>
              <CardContent className="grid gap-3 text-sm md:grid-cols-2">
                <Field label="Дата регистрации" value={formatDate(bundle.company.registrationDate)} />
                <Field label="Руководитель" value={bundle.company.director} />
                <Field label="Адрес" value={bundle.company.address} wide />
                <Field label="ОКВЭД" value={bundle.company.okved} wide />
                <Field label="Уставный капитал" value={formatMoney(bundle.company.authorizedCapital)} />
                <Field label="Массовый адрес" value={bundle.company.massAddress ? "да" : "нет"} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Риск-скоринг</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-3 flex items-end justify-between">
                  <div className="text-4xl font-semibold">{bundle.risk.score}</div>
                  <RiskBadge level={bundle.risk.level} />
                </div>
                <Progress value={bundle.risk.score} />
                <p className="mt-4 text-sm text-zinc-600">{bundle.report.summary}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risks">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Почему такой риск</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {bundle.risk.reasons.length === 0 ? (
                  <p className="text-sm text-zinc-500">Существенных риск-факторов не найдено.</p>
                ) : (
                  bundle.risk.reasons.map((reason) => (
                    <div key={reason.code} className="rounded-md border border-zinc-200 p-3">
                      <div className="flex justify-between gap-3">
                        <div className="font-medium">{reason.title}</div>
                        <Badge className="border-zinc-200 bg-zinc-50 text-zinc-700">+{reason.points}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-zinc-600">{reason.description}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Рекомендации</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {bundle.risk.recommendations.map((item) => (
                  <div key={item} className="flex gap-2 rounded-md border border-zinc-200 p-3 text-sm">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courts">
          <ListCard
            icon={Landmark}
            title="Судебные дела"
            empty="Судебные дела не найдены"
            items={bundle.courtCases.map((item) => `${item.id} · ${item.role === "defendant" ? "ответчик" : "истец"} · ${formatMoney(item.amount)} · ${item.status}`)}
          />
        </TabsContent>

        <TabsContent value="finance">
          <Card>
            <CardHeader><CardTitle>Финансовая динамика</CardTitle></CardHeader>
            <CardContent>
              <FinanceChart data={bundle.finances} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <ListCard
            icon={AlertTriangle}
            title={`Статус: ${monitoring.status}`}
            empty="Событий мониторинга нет"
            items={monitoring.events.map((event) => `${formatDate(event.date)} · ${event.title}`)}
          />
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <CardHeader><CardTitle>Даты обновления источников</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {bundle.report.sources.map((source) => (
                <div key={`${source.name}-${source.updatedAt}`} className="rounded-md border border-zinc-200 p-3 text-sm">
                  <div className="font-medium">{source.name}</div>
                  <div className="text-zinc-500">Обновлено {formatDate(source.updatedAt)}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ReportActions reportId={reportId} companyName={bundle.company.name} />
      <Disclaimer />
    </div>
  );
}

function Field({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <div className="text-xs uppercase text-zinc-500">{label}</div>
      <div className="mt-1 font-medium text-zinc-900">{value}</div>
    </div>
  );
}

function ListCard({
  icon: Icon,
  title,
  items,
  empty,
}: {
  icon: typeof FileText;
  title: string;
  items: string[];
  empty: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Icon className="h-5 w-5 text-zinc-600" />
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500">{empty}</p>
        ) : (
          items.map((item) => (
            <div key={item} className="rounded-md border border-zinc-200 p-3 text-sm text-zinc-700">
              {item}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
