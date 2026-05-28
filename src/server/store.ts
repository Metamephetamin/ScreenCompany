import type { CheckHistoryItem, Company, MonitoringItem, Report } from "@/lib/types";
import { normalizeEmailInput } from "@/lib/credentials";
import { mockMonitoringEvents } from "@/server/providers/mockData";
import { createPasswordHash, verifyPassword } from "@/server/security";

type AppStore = {
  history: CheckHistoryItem[];
  reports: Record<string, Report>;
  monitoring: Record<string, MonitoringItem>;
  users: { email: string; passwordHash?: string; password?: string; name: string }[];
};

const globalForStore = globalThis as unknown as { contragentRiskStore?: AppStore };

export const store =
  globalForStore.contragentRiskStore ??
  (globalForStore.contragentRiskStore = {
    history: [],
    reports: {},
    monitoring: {},
    users: [
      {
        email: "demo@risk.local",
        passwordHash: createPasswordHash("password123"),
        name: "Демо пользователь",
      },
    ],
  });

for (const user of store.users) {
  if (!user.passwordHash && user.password) {
    user.passwordHash = createPasswordHash(user.password);
    delete user.password;
  }
}

export function saveCheck(company: Company, report: Report) {
  store.reports[report.id] = report;
  store.history = [
    {
      id: `check-${company.id}-${report.id}`,
      companyId: company.id,
      reportId: report.id,
      name: company.name,
      inn: company.inn,
      checkedAt: report.createdAt,
      riskLevel: report.risk.level,
      riskScore: report.risk.score,
    },
    ...store.history.filter((item) => item.companyId !== company.id).slice(0, 20),
  ];
}

export function getHistory() {
  return store.history;
}

export function getReport(id: string) {
  return store.reports[id] ?? null;
}

export function getMonitoring(companyId: string): MonitoringItem {
  return (
    store.monitoring[companyId] ?? {
      companyId,
      status: "не отслеживается",
      events: mockMonitoringEvents[companyId] ?? [],
    }
  );
}

export function toggleMonitoring(companyId: string) {
  const current = getMonitoring(companyId);
  const enabled = current.status !== "в мониторинге";
  const next: MonitoringItem = {
    companyId,
    status: enabled ? "в мониторинге" : "не отслеживается",
    addedAt: enabled ? new Date().toISOString() : undefined,
    events: mockMonitoringEvents[companyId] ?? [],
  };
  store.monitoring[companyId] = next;
  return next;
}

export function getMonitoringList() {
  return Object.values(store.monitoring).filter((item) => item.status === "в мониторинге");
}

export function registerUser(email: string, password: string) {
  const normalizedEmail = normalizeEmailInput(email);
  if (store.users.some((user) => user.email === normalizedEmail)) return null;
  const user = {
    email: normalizedEmail,
    passwordHash: createPasswordHash(password),
    name: normalizedEmail.split("@")[0],
  };
  store.users.push(user);
  return user;
}

export function findUser(email: string, password: string) {
  const normalizedEmail = normalizeEmailInput(email);
  return (
    store.users.find(
      (user) =>
        user.email === normalizedEmail &&
        Boolean(user.passwordHash) &&
        verifyPassword(password, user.passwordHash as string),
    ) ?? null
  );
}
