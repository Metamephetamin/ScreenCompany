import type {
  BankruptcyInfo,
  Company,
  CourtCase,
  EnforcementCase,
  FinanceYear,
  SourceMeta,
} from "@/lib/types";

export type CompanyDataProvider = {
  findByInnOrOgrn(query: string): Promise<Company | null>;
  findById(id: string): Promise<Company | null>;
  list(): Promise<Company[]>;
};

export type CourtCasesProvider = {
  getCases(companyId: string): Promise<{ cases: CourtCase[]; source: SourceMeta }>;
};

export type FinanceProvider = {
  getFinances(companyId: string): Promise<{ finances: FinanceYear[]; source: SourceMeta }>;
};

export type EnforcementProvider = {
  getProceedings(companyId: string): Promise<{ cases: EnforcementCase[]; source: SourceMeta }>;
};

export type BankruptcyProvider = {
  getBankruptcyInfo(companyId: string): Promise<{ bankruptcy: BankruptcyInfo; source: SourceMeta }>;
};
