import type { Company } from "@/lib/types";
import type { CompanyDataProvider } from "@/server/providers/types";
import { randomUUID } from "node:crypto";

type DadataPartyResponse = {
  suggestions?: Array<{
    value?: string;
    unrestricted_value?: string;
    data?: {
      inn?: string;
      ogrn?: string;
      hid?: string;
      type?: "LEGAL" | "INDIVIDUAL";
      name?: {
        full_with_opf?: string;
        short_with_opf?: string;
        full?: string;
        short?: string;
      };
      fio?: {
        surname?: string;
        name?: string;
        patronymic?: string;
      };
      state?: {
        status?: string;
        registration_date?: number;
        liquidation_date?: number | null;
      };
      address?: {
        unrestricted_value?: string;
      };
      management?: {
        name?: string;
        post?: string;
      };
      okved?: string;
      okveds?: Array<{ main?: boolean; code?: string; name?: string }>;
      capital?: {
        value?: number;
      };
    };
  }>;
};

export function createDadataCompanyProvider(apiKey: string): CompanyDataProvider {
  async function findByInnOrOgrn(query: string) {
    const response = await fetch(
      "https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Token ${apiKey}`,
        },
        body: JSON.stringify({ query, count: 1, branch_type: "MAIN" }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`DaData returned ${response.status}`);
    }

    const data = (await response.json()) as DadataPartyResponse;
    const suggestion = data.suggestions?.[0];
    return suggestion ? mapDadataParty(suggestion) : null;
  }

  return {
    findByInnOrOgrn,
    findById: findByInnOrOgrn,
    async list() {
      return [];
    },
  };
}

function mapDadataParty(suggestion: NonNullable<DadataPartyResponse["suggestions"]>[number]): Company {
  const data = suggestion.data ?? {};
  const isIp = data.type === "INDIVIDUAL";
  const fio = [data.fio?.surname, data.fio?.name, data.fio?.patronymic].filter(Boolean).join(" ");
  const mainOkved = data.okveds?.find((item) => item.main) ?? data.okveds?.[0];
  const status = mapDadataStatus(data.state?.status);
  const registrationDate = data.state?.registration_date
    ? new Date(data.state.registration_date).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  return {
    id: data.inn ?? data.ogrn ?? data.hid ?? randomUUID(),
    name:
      data.name?.full_with_opf ??
      data.name?.short_with_opf ??
      suggestion.unrestricted_value ??
      suggestion.value ??
      fio,
    shortName: data.name?.short_with_opf ?? data.name?.short ?? suggestion.value ?? fio,
    type: isIp ? "ИП" : "ООО",
    inn: data.inn ?? "",
    ogrn: data.ogrn ?? "",
    registrationDate,
    status,
    address: data.address?.unrestricted_value ?? "Адрес не найден в ответе источника",
    director: isIp ? fio : [data.management?.post, data.management?.name].filter(Boolean).join(": "),
    okved: mainOkved?.name ? `${mainOkved.code} - ${mainOkved.name}` : data.okved ?? "ОКВЭД не указан",
    authorizedCapital: data.capital?.value ?? null,
    massAddress: false,
    directorChangesLastYear: 0,
    sources: [{ name: "ЕГРЮЛ/ЕГРИП", updatedAt: new Date().toISOString() }],
  };
}

function mapDadataStatus(status?: string): Company["status"] {
  if (status === "LIQUIDATING" || status === "LIQUIDATED") return "LIQUIDATION";
  if (status === "BANKRUPT") return "BANKRUPTCY";
  if (status === "ACTIVE") return "ACTIVE";
  return "INACTIVE";
}
