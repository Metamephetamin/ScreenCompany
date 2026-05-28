import {
  calculateRiskScore,
  monthsSince,
  negativeProfitYears,
  revenueDropPercent,
} from "@/lib/riskScoring";
import type { CompanyCheckResult, Report, SourceMeta } from "@/lib/types";
import {
  bankruptcyProvider,
  companyDataProvider,
  courtCasesProvider,
  enforcementProvider,
  financeProvider,
} from "@/server/providers/mockProviders";
import { saveCheck } from "@/server/store";

export async function runCompanyCheck(query: string): Promise<CompanyCheckResult | null> {
  return buildCompanyCheck(query, { persist: true });
}

async function buildCompanyCheck(
  query: string,
  { persist }: { persist: boolean },
): Promise<CompanyCheckResult | null> {
  const company = await companyDataProvider.findByInnOrOgrn(query);
  if (!company) return null;

  const [{ cases: courtCases, source: courtSource }, { finances, source: financeSource }, { cases: enforcementCases, source: enforcementSource }, { bankruptcy, source: bankruptcySource }] =
    await Promise.all([
      courtCasesProvider.getCases(company.id),
      financeProvider.getFinances(company.id),
      enforcementProvider.getProceedings(company.id),
      bankruptcyProvider.getBankruptcyInfo(company.id),
    ]);

  const risk = calculateRiskScore({
    status: company.status,
    bankruptcy: bankruptcy.hasSigns,
    enforcementProceedings: enforcementCases.length,
    defendantCourtCases: courtCases.filter((item) => item.role === "defendant").length,
    ageMonths: monthsSince(company.registrationDate),
    authorizedCapital: company.authorizedCapital,
    negativeProfitYears: negativeProfitYears(finances),
    revenueDropPercent: revenueDropPercent(finances),
    massAddress: company.massAddress,
    frequentDirectorChanges: company.directorChangesLastYear >= 2,
  });

  const sources: SourceMeta[] = [
    ...company.sources,
    courtSource,
    financeSource,
    enforcementSource,
    bankruptcySource,
  ];

  const report: Report = {
    id: `report-${company.id}-${Date.now()}`,
    companyId: company.id,
    createdAt: new Date().toISOString(),
    summary: buildSummary(risk.level),
    risk,
    sources,
  };

  if (persist) saveCheck(company, report);

  return { company, risk, courtCases, finances, enforcementCases, bankruptcy, report };
}

export async function getCompanyBundle(companyId: string) {
  const company = await companyDataProvider.findById(companyId);
  if (!company) return null;
  const result = await buildCompanyCheck(company.inn, { persist: false });
  return result;
}

function buildSummary(level: string) {
  if (level === "low") return "Существенных публичных риск-факторов не найдено.";
  if (level === "medium") return "Есть факторы, которые требуют ограничить условия сделки.";
  return "Найдены существенные риск-факторы. Нужна предоплата или отказ от отсрочки.";
}
