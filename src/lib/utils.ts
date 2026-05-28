import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiskLevel, SourceMeta } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: number | null) {
  if (value === null) return "нет данных";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatSourceStatus(source: SourceMeta) {
  if (source.status === "not_configured") return "Источник не подключен";
  if (source.status === "mock") return `Демо-данные от ${formatDate(source.updatedAt)}`;
  return `Обновлено ${formatDate(source.updatedAt)}`;
}

export function riskLabel(level: RiskLevel) {
  return level === "low" ? "Низкий риск" : level === "medium" ? "Средний риск" : "Высокий риск";
}

export function riskClasses(level: RiskLevel) {
  if (level === "low") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (level === "medium") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-red-200 bg-red-50 text-red-800";
}
