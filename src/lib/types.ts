export type RiskLevel = "low" | "medium" | "high";

export type CompanyStatus = "ACTIVE" | "LIQUIDATION" | "INACTIVE" | "BANKRUPTCY";

export type SourceName =
  | "ЕГРЮЛ/ЕГРИП"
  | "Арбитраж"
  | "Финансы"
  | "ФССП"
  | "Федресурс";

export type SourceMeta = {
  name: SourceName;
  updatedAt: string;
  status?: "connected" | "not_configured" | "mock";
};

export type Company = {
  id: string;
  name: string;
  shortName: string;
  type: "ООО" | "ИП";
  inn: string;
  ogrn: string;
  registrationDate: string;
  status: CompanyStatus;
  address: string;
  director: string;
  okved: string;
  authorizedCapital: number | null;
  massAddress: boolean;
  directorChangesLastYear: number;
  sources: SourceMeta[];
};

export type CourtCase = {
  id: string;
  role: "defendant" | "claimant";
  title: string;
  amount: number;
  date: string;
  status: string;
};

export type FinanceYear = {
  year: number;
  revenue: number | null;
  profit: number | null;
};

export type EnforcementCase = {
  id: string;
  title: string;
  amount: number;
  date: string;
  status: string;
};

export type BankruptcyInfo = {
  hasSigns: boolean;
  events: string[];
};

export type RiskReason = {
  code:
    | "young_company"
    | "liquidation"
    | "inactive"
    | "director_changes"
    | "mass_address"
    | "minimal_capital"
    | "court_defendant"
    | "enforcement"
    | "bankruptcy"
    | "negative_profit"
    | "revenue_drop";
  title: string;
  description: string;
  points: number;
};

export type RiskResult = {
  score: number;
  level: RiskLevel;
  reasons: RiskReason[];
  recommendations: string[];
};

export type CompanyCheckResult = {
  company: Company;
  risk: RiskResult;
  courtCases: CourtCase[];
  finances: FinanceYear[];
  enforcementCases: EnforcementCase[];
  bankruptcy: BankruptcyInfo;
  report: Report;
};

export type Report = {
  id: string;
  companyId: string;
  createdAt: string;
  summary: string;
  risk: RiskResult;
  sources: SourceMeta[];
};

export type CheckHistoryItem = {
  id: string;
  companyId: string;
  reportId: string;
  name: string;
  inn: string;
  checkedAt: string;
  riskLevel: RiskLevel;
  riskScore: number;
};

export type MonitoringEvent = {
  id: string;
  companyId: string;
  title: string;
  date: string;
  severity: RiskLevel;
};

export type MonitoringItem = {
  companyId: string;
  status: "в мониторинге" | "не отслеживается";
  addedAt?: string;
  events: MonitoringEvent[];
};
