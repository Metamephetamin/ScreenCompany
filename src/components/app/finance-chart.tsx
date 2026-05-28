"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FinanceYear } from "@/lib/types";
import { formatMoney } from "@/lib/utils";

export function FinanceChart({ data }: { data: FinanceYear[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={[...data].reverse()}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip formatter={(value) => formatMoney(Number(value))} />
          <Area dataKey="revenue" name="Выручка" stroke="#18181b" fill="#e4e4e7" />
          <Area dataKey="profit" name="Прибыль" stroke="#71717a" fill="#f4f4f5" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
