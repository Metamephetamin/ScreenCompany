"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RiskBadge } from "@/components/app/risk-badge";
import { Input } from "@/components/ui/input";
import type { CheckHistoryItem, RiskLevel } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function HistoryTable({ items }: { items: CheckHistoryItem[] }) {
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState<RiskLevel | "all">("all");

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const matchesRisk = risk === "all" || item.riskLevel === risk;
        const haystack = `${item.name} ${item.inn}`.toLowerCase();
        return matchesRisk && haystack.includes(query.toLowerCase());
      }),
    [items, query, risk],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 md:flex-row">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по названию или ИНН"
          className="md:max-w-sm"
        />
        <select
          value={risk}
          onChange={(event) => setRisk(event.target.value as RiskLevel | "all")}
          className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm"
        >
          <option value="all">Все риски</option>
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-zinc-500">
            <tr>
              <th className="pb-2">Компания</th>
              <th className="pb-2">Риск</th>
              <th className="pb-2">Дата</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((item) => (
              <tr key={item.id}>
                <td className="py-3">
                  <Link href={`/company/${item.companyId}?report=${item.reportId}`} className="font-medium hover:underline">
                    {item.name}
                  </Link>
                  <div className="text-xs text-zinc-500">ИНН {item.inn}</div>
                </td>
                <td className="py-3">
                  <RiskBadge level={item.riskLevel} />
                </td>
                <td className="py-3 text-zinc-500">{formatDate(item.checkedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-5 text-sm text-zinc-500">Ничего не найдено.</p>}
      </div>
    </div>
  );
}
