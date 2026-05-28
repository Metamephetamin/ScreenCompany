import type { EnforcementCase } from "@/lib/types";
import type { EnforcementProvider } from "@/server/providers/types";
import { companyDataProvider } from "@/server/providers";
import { randomUUID } from "node:crypto";

type DamiaProceeding = {
  "РегНомер"?: string;
  "Дата"?: string;
  "Предмет"?: string;
  "Сумма"?: number | string;
  "Остаток"?: number | string;
  "Статус"?: string;
};

type DamiaFsspResponse = { result?: DamiaProceeding[] } | DamiaProceeding[] | Record<string, unknown>;

export function createDamiaFsspProvider(apiKey: string): EnforcementProvider {
  return {
    async getProceedings(companyId) {
      const company = await companyDataProvider.findById(companyId);
      if (!company?.inn) {
        return { cases: [], source: { name: "ФССП", updatedAt: new Date().toISOString() } };
      }

      const url = new URL("https://api.damia.ru/fssp/isps");
      url.searchParams.set("inn", company.inn);
      url.searchParams.set("format", "2");
      url.searchParams.set("key", apiKey);

      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`DaMIA API-ФССП returned ${response.status}`);
      }

      return {
        cases: mapDamiaFsspProceedings((await response.json()) as DamiaFsspResponse),
        source: { name: "ФССП", updatedAt: new Date().toISOString() },
      };
    },
  };
}

export function mapDamiaFsspProceedings(data: DamiaFsspResponse): EnforcementCase[] {
  return extractProceedingRows(data).map((row) => {
    const registrationNumber = valueToString(row["РегНомер"]) || randomUUID();
    return {
      id: registrationNumber,
      title: valueToString(row["Предмет"]) || "Исполнительное производство",
      amount: valueToNumber(row["Остаток"]) || valueToNumber(row["Сумма"]),
      date: normalizeDate(valueToString(row["Дата"])),
      status: valueToString(row["Статус"]) || "Статус не указан",
    };
  });
}

function extractProceedingRows(data: DamiaFsspResponse): DamiaProceeding[] {
  if (Array.isArray(data)) return data;
  if ("result" in data && Array.isArray(data.result)) return data.result;

  const nestedRows = Object.values(data).flatMap((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];
    return Object.entries(value as Record<string, unknown>).map(([registrationNumber, row]) =>
      row && typeof row === "object" && !Array.isArray(row)
        ? ({ "РегНомер": registrationNumber, ...(row as DamiaProceeding) } as DamiaProceeding)
        : null,
    );
  });
  const filteredNestedRows = nestedRows.filter((row): row is DamiaProceeding => Boolean(row));
  if (filteredNestedRows.length > 0) return filteredNestedRows;

  const possibleRows = Object.values(data).find((value) => Array.isArray(value));
  return Array.isArray(possibleRows) ? (possibleRows as DamiaProceeding[]) : [];
}

function valueToString(value: unknown) {
  return typeof value === "string" ? value : value === undefined || value === null ? "" : String(value);
}

function valueToNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  const parsed = Number(value.replace(",", ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDate(value: string) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const parts = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (parts) return `${parts[3]}-${parts[2]}-${parts[1]}`;
  return value;
}
