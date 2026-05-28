import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { Disclaimer } from "@/components/app/disclaimer";
import { ReportActions } from "@/components/app/report-actions";
import { RiskBadge } from "@/components/app/risk-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { companyDataProvider } from "@/server/providers";
import { getReport } from "@/server/store";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) notFound();
  const company = await companyDataProvider.findById(report.companyId);
  if (!company) notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
            <FileText className="h-4 w-4" />
            Отчет от {formatDate(report.createdAt)}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
          <p className="mt-1 text-sm text-zinc-500">ИНН {company.inn} · ОГРН {company.ogrn}</p>
        </div>
        <ReportActions reportId={report.id} companyName={company.name} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Краткое резюме</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <RiskBadge level={report.risk.level} />
              <p className="mt-3 text-zinc-700">{report.summary}</p>
            </div>
            <div className="w-full max-w-xs">
              <div className="mb-2 flex items-end justify-between">
                <span className="text-sm text-zinc-500">Риск-балл</span>
                <span className="text-3xl font-semibold">{report.risk.score}</span>
              </div>
              <Progress value={report.risk.score} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Причины риска</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {report.risk.reasons.length === 0 ? (
              <p className="text-sm text-zinc-500">Существенных риск-факторов не найдено.</p>
            ) : (
              report.risk.reasons.map((reason) => (
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
            {report.risk.recommendations.map((item) => (
              <div key={item} className="rounded-md border border-zinc-200 p-3 text-sm text-zinc-700">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Источники</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {report.sources.map((source) => (
            <div key={`${source.name}-${source.updatedAt}`} className="rounded-md border border-zinc-200 p-3 text-sm">
              <div className="font-medium">{source.name}</div>
              <div className="text-zinc-500">Обновлено {formatDate(source.updatedAt)}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button asChild variant="secondary">
          <Link href={`/company/${company.id}?report=${report.id}`}>К карточке компании</Link>
        </Button>
      </div>
      <Disclaimer />
    </div>
  );
}
