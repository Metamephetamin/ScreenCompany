import type { BankruptcyInfo, SourceName, SourceMeta } from "@/lib/types";
import type { BankruptcyProvider, CourtCasesProvider, EnforcementProvider, FinanceProvider } from "./types";

function unavailableSource(name: SourceName): SourceMeta {
  return {
    name,
    updatedAt: new Date().toISOString(),
    status: "not_configured",
  };
}

export const unavailableCourtCasesProvider: CourtCasesProvider = {
  async getCases() {
    return { cases: [], source: unavailableSource("Арбитраж") };
  },
};

export const unavailableFinanceProvider: FinanceProvider = {
  async getFinances() {
    return { finances: [], source: unavailableSource("Финансы") };
  },
};

export const unavailableEnforcementProvider: EnforcementProvider = {
  async getProceedings() {
    return { cases: [], source: unavailableSource("ФССП") };
  },
};

export const unavailableBankruptcyProvider: BankruptcyProvider = {
  async getBankruptcyInfo() {
    const bankruptcy: BankruptcyInfo = { hasSigns: false, events: [] };
    return { bankruptcy, source: unavailableSource("Федресурс") };
  },
};
