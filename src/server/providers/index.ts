import {
  bankruptcyProvider,
  companyDataProvider as mockCompanyDataProvider,
  courtCasesProvider,
  enforcementProvider,
  financeProvider,
} from "@/server/providers/mockProviders";
import { createDadataCompanyProvider } from "@/server/providers/dadataProvider";
import { createDamiaFsspProvider } from "@/server/providers/damiaFsspProvider";

export const companyDataProvider = process.env.DADATA_API_KEY
  ? createDadataCompanyProvider(process.env.DADATA_API_KEY)
  : mockCompanyDataProvider;

export const activeEnforcementProvider = process.env.DAMIA_FSSP_API_KEY
  ? createDamiaFsspProvider(process.env.DAMIA_FSSP_API_KEY)
  : enforcementProvider;

export {
  bankruptcyProvider,
  courtCasesProvider,
  activeEnforcementProvider as enforcementProvider,
  financeProvider,
};
