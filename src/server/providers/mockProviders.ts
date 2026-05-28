import {
  mockBankruptcy,
  mockCompanies,
  mockCourtCases,
  mockEnforcement,
  mockFinances,
  sourceDates,
} from "@/server/providers/mockData";
import type {
  BankruptcyProvider,
  CompanyDataProvider,
  CourtCasesProvider,
  EnforcementProvider,
  FinanceProvider,
} from "@/server/providers/types";

export const companyDataProvider: CompanyDataProvider = {
  async findByInnOrOgrn(query) {
    const normalized = query.replace(/\D/g, "");
    return (
      mockCompanies.find(
        (company) => company.inn === normalized || company.ogrn === normalized,
      ) ?? null
    );
  },
  async findById(id) {
    return mockCompanies.find((company) => company.id === id) ?? null;
  },
  async list() {
    return mockCompanies;
  },
};

export const courtCasesProvider: CourtCasesProvider = {
  async getCases(companyId) {
    return { cases: mockCourtCases[companyId] ?? [], source: sourceDates.courts };
  },
};

export const financeProvider: FinanceProvider = {
  async getFinances(companyId) {
    return { finances: mockFinances[companyId] ?? [], source: sourceDates.finance };
  },
};

export const enforcementProvider: EnforcementProvider = {
  async getProceedings(companyId) {
    return { cases: mockEnforcement[companyId] ?? [], source: sourceDates.enforcement };
  },
};

export const bankruptcyProvider: BankruptcyProvider = {
  async getBankruptcyInfo(companyId) {
    return {
      bankruptcy: mockBankruptcy[companyId] ?? { hasSigns: false, events: [] },
      source: sourceDates.bankruptcy,
    };
  },
};
