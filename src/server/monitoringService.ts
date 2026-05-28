import type { MonitoringEvent, RiskReason } from "@/lib/types";
import { getCompanyBundle } from "@/server/riskEngine";
import { prisma } from "@/server/prisma";
import { persistMonitoringEvents } from "@/server/store";

export async function runMonitoringSweep() {
  const items = await prisma.monitoringItem.findMany({
    where: { active: true },
    include: { company: true, events: true },
  });

  const results = [];
  for (const item of items) {
    const bundle = await getCompanyBundle(item.companyId);
    if (!bundle) continue;

    const events = buildRiskEvents(item.companyId, bundle.risk.reasons);
    await persistMonitoringEvents(item.companyId, events, item.userId);
    results.push({ companyId: item.companyId, events: events.length });
  }

  return {
    checked: items.length,
    results,
    checkedAt: new Date().toISOString(),
  };
}

function buildRiskEvents(
  companyId: string,
  reasons: RiskReason[],
): Array<Omit<MonitoringEvent, "companyId"> & { fingerprint: string; source: string }> {
  return reasons.map((reason) => ({
    id: `risk-${companyId}-${reason.code}`,
    title: reason.title,
    date: new Date().toISOString(),
    severity: reason.points >= 20 ? "high" : reason.points >= 15 ? "medium" : "low",
    fingerprint: `risk:${reason.code}`,
    source: "risk-engine",
  }));
}
