import {
  bankruptcyProvider,
  companyDataProvider as mockCompanyDataProvider,
  courtCasesProvider,
  enforcementProvider,
  financeProvider,
} from "@/server/providers/mockProviders";
import { createDadataCompanyProvider } from "@/server/providers/dadataProvider";
import { createDamiaFsspProvider } from "@/server/providers/damiaFsspProvider";
import {
  unavailableBankruptcyProvider,
  unavailableCourtCasesProvider,
  unavailableEnforcementProvider,
  unavailableFinanceProvider,
} from "@/server/providers/unavailableProviders";

const useMockProviders = process.env.NODE_ENV !== "production";

export const companyDataProvider = process.env.DADATA_API_KEY
  ? createDadataCompanyProvider(process.env.DADATA_API_KEY)
  : mockCompanyDataProvider;

export const activeEnforcementProvider = process.env.DAMIA_FSSP_API_KEY
  ? createDamiaFsspProvider(process.env.DAMIA_FSSP_API_KEY)
  : useMockProviders
    ? enforcementProvider
    : unavailableEnforcementProvider;

export const activeCourtCasesProvider = useMockProviders
  ? courtCasesProvider
  : unavailableCourtCasesProvider;

export const activeFinanceProvider = useMockProviders ? financeProvider : unavailableFinanceProvider;

export const activeBankruptcyProvider = useMockProviders
  ? bankruptcyProvider
  : unavailableBankruptcyProvider;

export {
  activeBankruptcyProvider as bankruptcyProvider,
  activeCourtCasesProvider as courtCasesProvider,
  activeEnforcementProvider as enforcementProvider,
  activeFinanceProvider as financeProvider,
};
