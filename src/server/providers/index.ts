import {
  bankruptcyProvider,
  companyDataProvider as mockCompanyDataProvider,
  courtCasesProvider,
  enforcementProvider,
  financeProvider,
} from "@/server/providers/mockProviders";
import { createDadataCompanyProvider } from "@/server/providers/dadataProvider";

export const companyDataProvider = process.env.DADATA_API_KEY
  ? createDadataCompanyProvider(process.env.DADATA_API_KEY)
  : mockCompanyDataProvider;

export { bankruptcyProvider, courtCasesProvider, enforcementProvider, financeProvider };
