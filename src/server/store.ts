import type {
  CheckHistoryItem,
  Company,
  MonitoringEvent,
  MonitoringItem,
  Report,
  RiskLevel,
  RiskReason,
  SourceMeta,
} from "@/lib/types";
import { randomUUID } from "node:crypto";
import { normalizeEmailInput } from "@/lib/credentials";
import { mockMonitoringEvents } from "@/server/providers/mockData";
import { companyDataProvider } from "@/server/providers";
import { prisma } from "@/server/prisma";
import { createPasswordHash, verifyPassword } from "@/server/security";

const demoEmail = "demo@risk.local";
const systemUserEmail = "system@risk.local";
const useMockMonitoringEvents = process.env.NODE_ENV !== "production";

export async function ensureDemoUser() {
  await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: "Демо пользователь",
      passwordHash: createPasswordHash("password123"),
    },
  });
}

async function ensureSystemUser() {
  return prisma.user.upsert({
    where: { email: systemUserEmail },
    update: {},
    create: {
      email: systemUserEmail,
      name: "System",
      passwordHash: createPasswordHash(randomUUID()),
    },
  });
}

async function ensureCompany(company: Company) {
  return prisma.company.upsert({
    where: { id: company.id },
    update: {
      name: company.name,
      shortName: company.shortName,
      type: company.type,
      inn: company.inn,
      ogrn: company.ogrn,
      registrationDate: new Date(company.registrationDate),
      status: company.status,
      address: company.address,
      director: company.director,
      okved: company.okved,
      authorizedCapital: company.authorizedCapital,
      massAddress: company.massAddress,
      directorChangesYear: company.directorChangesLastYear,
    },
    create: {
      id: company.id,
      name: company.name,
      shortName: company.shortName,
      type: company.type,
      inn: company.inn,
      ogrn: company.ogrn,
      registrationDate: new Date(company.registrationDate),
      status: company.status,
      address: company.address,
      director: company.director,
      okved: company.okved,
      authorizedCapital: company.authorizedCapital,
      massAddress: company.massAddress,
      directorChangesYear: company.directorChangesLastYear,
    },
  });
}

export async function saveCheck(
  company: Company,
  report: Report,
  userId?: string | null,
  fingerprint?: { clientIpHash?: string; deviceHash?: string },
) {
  await ensureCompany(company);
  const user = userId ? null : await ensureSystemUser();
  const ownerId = userId ?? user?.id ?? null;

  await prisma.report.upsert({
    where: { id: report.id },
    update: {
      summary: report.summary,
      score: report.risk.score,
      level: report.risk.level,
      reasonsJson: report.risk.reasons,
      recommendations: report.risk.recommendations,
      sourcesJson: report.sources,
      createdAt: new Date(report.createdAt),
    },
    create: {
      id: report.id,
      companyId: company.id,
      summary: report.summary,
      score: report.risk.score,
      level: report.risk.level,
      reasonsJson: report.risk.reasons,
      recommendations: report.risk.recommendations,
      sourcesJson: report.sources,
      createdAt: new Date(report.createdAt),
    },
  });

  await prisma.check.create({
    data: {
      userId: ownerId,
      companyId: company.id,
      reportId: report.id,
      score: report.risk.score,
      level: report.risk.level,
      createdAt: new Date(report.createdAt),
      clientIpHash: fingerprint?.clientIpHash,
      deviceHash: fingerprint?.deviceHash,
    },
  });
}

export async function getHistory(userId?: string | null): Promise<CheckHistoryItem[]> {
  const where = userId ? { userId } : {};
  const checks = await prisma.check.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { company: true },
  });

  return checks.map((check) => ({
    id: check.id,
    companyId: check.companyId,
    reportId: check.reportId,
    name: check.company.name,
    inn: check.company.inn,
    checkedAt: check.createdAt.toISOString(),
    riskLevel: check.level as RiskLevel,
    riskScore: check.score,
  }));
}

export async function getReport(id: string): Promise<Report | null> {
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return null;

  return {
    id: report.id,
    companyId: report.companyId,
    createdAt: report.createdAt.toISOString(),
    summary: report.summary,
    risk: {
      score: report.score,
      level: report.level as RiskLevel,
      reasons: report.reasonsJson as RiskReason[],
      recommendations: report.recommendations as string[],
    },
    sources: report.sourcesJson as SourceMeta[],
  };
}

export async function getReportForUser(
  id: string,
  user: { id: string; role?: string | null },
): Promise<Report | null> {
  if (user.role === "admin") return getReport(id);

  const check = await prisma.check.findFirst({
    where: { reportId: id, userId: user.id },
    select: { reportId: true },
  });
  if (!check) return null;
  return getReport(id);
}

export async function canAccessCompany(
  companyId: string,
  user: { id: string; role?: string | null },
) {
  if (user.role === "admin") return true;
  const check = await prisma.check.findFirst({
    where: { companyId, userId: user.id },
    select: { id: true },
  });
  return Boolean(check);
}

export async function getMonitoring(companyId: string, userId?: string | null): Promise<MonitoringItem> {
  await ensureCompanyForId(companyId);
  const ownerId = await resolveOwnerId(userId);
  const item = await prisma.monitoringItem.findFirst({
    where: { companyId, userId: ownerId },
    include: { events: { orderBy: { eventDate: "desc" } } },
  });

  if (!item || !item.active) {
    return {
      companyId,
      status: "не отслеживается",
      events: useMockMonitoringEvents ? (mockMonitoringEvents[companyId] ?? []) : [],
    };
  }

  return mapMonitoringItem(item.companyId, item.createdAt, item.events);
}

export async function toggleMonitoring(companyId: string, userId?: string | null) {
  await ensureCompanyForId(companyId);
  const ownerId = await resolveOwnerId(userId);
  const existing = await prisma.monitoringItem.findFirst({
    where: { companyId, userId: ownerId },
    include: { events: true },
  });

  if (existing) {
    const active = !existing.active;
    const item = await prisma.monitoringItem.update({
      where: { id: existing.id },
      data: { active },
      include: { events: { orderBy: { eventDate: "desc" } } },
    });
    if (active && useMockMonitoringEvents) await seedMonitoringEvents(item.id, companyId);
    const refreshed = await prisma.monitoringItem.findUnique({
      where: { id: item.id },
      include: { events: { orderBy: { eventDate: "desc" } } },
    });
    return refreshed ? mapMonitoringItem(refreshed.companyId, refreshed.createdAt, refreshed.events) : getMonitoring(companyId, userId);
  }

  const item = await prisma.monitoringItem.create({
    data: { companyId, userId: ownerId, active: true },
    include: { events: true },
  });
  if (useMockMonitoringEvents) await seedMonitoringEvents(item.id, companyId);
  const refreshed = await prisma.monitoringItem.findUnique({
    where: { id: item.id },
    include: { events: { orderBy: { eventDate: "desc" } } },
  });
  return refreshed ? mapMonitoringItem(refreshed.companyId, refreshed.createdAt, refreshed.events) : getMonitoring(companyId, userId);
}

export async function getMonitoringList(userId?: string | null): Promise<MonitoringItem[]> {
  const ownerId = await resolveOwnerId(userId);
  const items = await prisma.monitoringItem.findMany({
    where: { userId: ownerId, active: true },
    orderBy: { createdAt: "desc" },
    include: { events: { orderBy: { eventDate: "desc" } } },
  });

  return items.map((item) => mapMonitoringItem(item.companyId, item.createdAt, item.events));
}

export async function registerUser(email: string, password: string) {
  const normalizedEmail = normalizeEmailInput(email);
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) return null;

  return prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash: createPasswordHash(password),
      name: normalizedEmail.split("@")[0],
    },
  });
}

export async function findUser(email: string, password: string) {
  if (process.env.NODE_ENV !== "production") await ensureDemoUser();
  const normalizedEmail = normalizeEmailInput(email);
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user?.passwordHash) return null;
  return verifyPassword(password, user.passwordHash) ? user : null;
}

export async function persistMonitoringEvents(
  companyId: string,
  events: Array<Omit<MonitoringEvent, "companyId"> & { fingerprint?: string; source?: string }>,
  userId?: string | null,
) {
  await ensureCompanyForId(companyId);
  const ownerId = await resolveOwnerId(userId);
  const item =
    (await prisma.monitoringItem.findFirst({ where: { companyId, userId: ownerId } })) ??
    (await prisma.monitoringItem.create({ data: { companyId, userId: ownerId, active: true } }));

  for (const event of events) {
    const fingerprint = event.fingerprint ?? `${event.date}:${event.title}`;
    await prisma.monitoringEvent.upsert({
      where: {
        monitoringItemId_fingerprint: {
          monitoringItemId: item.id,
          fingerprint,
        },
      },
      update: {
        title: event.title,
        severity: event.severity,
        eventDate: new Date(event.date),
        source: event.source,
      },
      create: {
        id: `${item.id}:${fingerprint}`,
        monitoringItemId: item.id,
        title: event.title,
        severity: event.severity,
        eventDate: new Date(event.date),
        fingerprint,
        source: event.source,
      },
    });
  }

  await prisma.monitoringItem.update({
    where: { id: item.id },
    data: { lastCheckedAt: new Date() },
  });
}

async function ensureCompanyForId(companyId: string) {
  const existing = await prisma.company.findUnique({ where: { id: companyId } });
  if (existing) return existing;
  const company = await companyDataProvider.findById(companyId);
  if (!company) throw new Error(`Company ${companyId} not found`);
  return ensureCompany(company);
}

async function resolveOwnerId(userId?: string | null) {
  if (userId) return userId;
  const user = await ensureSystemUser();
  return user.id;
}

async function seedMonitoringEvents(monitoringItemId: string, companyId: string) {
  const events = mockMonitoringEvents[companyId] ?? [];
  for (const event of events) {
    await prisma.monitoringEvent.upsert({
      where: {
        monitoringItemId_fingerprint: {
          monitoringItemId,
          fingerprint: event.id,
        },
      },
      update: {
        title: event.title,
        severity: event.severity,
        eventDate: new Date(event.date),
        source: "mock",
      },
      create: {
        id: `${monitoringItemId}:${event.id}`,
        monitoringItemId,
        title: event.title,
        severity: event.severity,
        eventDate: new Date(event.date),
        fingerprint: event.id,
        source: "mock",
      },
    });
  }
}

function mapMonitoringItem(
  companyId: string,
  addedAt: Date,
  events: Array<{
    id: string;
    title: string;
    eventDate: Date;
    severity: string;
  }>,
): MonitoringItem {
  return {
    companyId,
    status: "в мониторинге",
    addedAt: addedAt.toISOString(),
    events: events.map((event) => ({
      id: event.id,
      companyId,
      title: event.title,
      date: event.eventDate.toISOString(),
      severity: event.severity as RiskLevel,
    })),
  };
}
