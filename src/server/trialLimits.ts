import { createHash, randomBytes } from "node:crypto";
import { normalizeEmailInput } from "@/lib/credentials";

export const FREE_UNVERIFIED_CHECK_LIMIT = 1;
export const FREE_VERIFIED_CHECK_LIMIT = 3;
const paidCheckLimit = 100;

const publicEmailDomains = new Set([
  "bk.ru",
  "gmail.com",
  "hotmail.com",
  "icloud.com",
  "inbox.ru",
  "list.ru",
  "mail.ru",
  "outlook.com",
  "rambler.ru",
  "ya.ru",
  "yahoo.com",
  "yandex.ru",
]);

export type WorkspaceStatus = "unverified" | "pending_review" | "verified" | "rejected";
export type PlanName = "free" | "pro" | "business";

export type TrialDecisionInput = {
  plan: string | null | undefined;
  workspaceStatus: string | null | undefined;
  userChecks: number;
  deviceChecks: number;
  ipChecks: number;
};

export type TrialDecision = {
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
  reason?: string;
};

export type CheckFingerprint = {
  clientIpHash: string;
  deviceHash: string;
};

export function buildTrialDecision(input: TrialDecisionInput): TrialDecision {
  const plan = normalizePlan(input.plan);
  const verified = input.workspaceStatus === "verified";
  const limit = plan === "free" ? (verified ? FREE_VERIFIED_CHECK_LIMIT : FREE_UNVERIFIED_CHECK_LIMIT) : paidCheckLimit;
  const used = Math.max(input.userChecks, plan === "free" ? input.deviceChecks : 0, plan === "free" ? input.ipChecks : 0);
  const remaining = Math.max(limit - used, 0);

  if (remaining <= 0) {
    return {
      allowed: false,
      limit,
      used,
      remaining,
      reason: verified
        ? "Лимит Free исчерпан. Для продолжения подключите Pro."
        : "Free без подтверждения дает 1 проверку. Подтвердите организацию или подключите Pro.",
    };
  }

  return { allowed: true, limit, used, remaining };
}

export function isCorporateEmail(email: string) {
  const domain = normalizeEmailInput(email).split("@")[1];
  return Boolean(domain && !publicEmailDomains.has(domain));
}

export function createDeviceToken() {
  return randomBytes(32).toString("hex");
}

export function hashTrialValue(value: string) {
  const secret = process.env.TRIAL_HASH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "local-trial-secret";
  return createHash("sha256").update(`${secret}:${value}`).digest("hex");
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwardedFor || realIp || "unknown";
}

export async function getTrialAccess(userId: string, fingerprint: CheckFingerprint) {
  const { prisma } = await import("@/server/prisma");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { workspace: true, subscriptions: { where: { active: true }, orderBy: { createdAt: "desc" } } },
  });

  const subscription = user?.subscriptions[0];
  const plan = normalizePlan(subscription?.plan ?? user?.workspace?.plan ?? "free");
  const workspaceStatus = user?.workspace?.verificationStatus ?? "unverified";

  const [userChecks, deviceChecks, ipChecks] = await Promise.all([
    prisma.check.count({ where: { userId } }),
    prisma.check.count({ where: { deviceHash: fingerprint.deviceHash } }),
    prisma.check.count({ where: { clientIpHash: fingerprint.clientIpHash } }),
  ]);

  return {
    ...buildTrialDecision({ plan, workspaceStatus, userChecks, deviceChecks, ipChecks }),
    plan,
    workspaceStatus,
  };
}

export async function getUserTrialSummary(userId: string) {
  const { prisma } = await import("@/server/prisma");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { workspace: true, subscriptions: { where: { active: true }, orderBy: { createdAt: "desc" } } },
  });
  const checks = await prisma.check.count({ where: { userId } });
  const plan = normalizePlan(user?.subscriptions[0]?.plan ?? user?.workspace?.plan ?? "free");
  const workspaceStatus = user?.workspace?.verificationStatus ?? "unverified";
  const limit = plan === "free" && workspaceStatus === "verified" ? FREE_VERIFIED_CHECK_LIMIT : plan === "free" ? FREE_UNVERIFIED_CHECK_LIMIT : paidCheckLimit;

  return {
    plan,
    workspaceStatus,
    limit,
    used: checks,
    remaining: Math.max(limit - checks, 0),
    workspace: user?.workspace ?? null,
  };
}

export async function upsertWorkspaceClaim({
  userId,
  inn,
  contactEmail,
}: {
  userId: string;
  inn: string;
  contactEmail?: string;
}) {
  const { prisma } = await import("@/server/prisma");
  const normalizedInn = inn.replace(/\D/g, "");
  const normalizedEmail = contactEmail ? normalizeEmailInput(contactEmail) : null;
  const status = normalizedEmail && isCorporateEmail(normalizedEmail) ? "pending_review" : "unverified";

  return prisma.workspace.upsert({
    where: { userId },
    update: {
      inn: normalizedInn,
      contactEmail: normalizedEmail,
      verificationStatus: status,
      checksLimit: FREE_UNVERIFIED_CHECK_LIMIT,
      reviewNote:
        status === "pending_review"
          ? "Заявка ожидает ручного подтверждения рабочей почты или документов."
          : "Для расширения Free нужна рабочая почта или ручная проверка.",
    },
    create: {
      userId,
      inn: normalizedInn,
      contactEmail: normalizedEmail,
      verificationStatus: status,
      checksLimit: FREE_UNVERIFIED_CHECK_LIMIT,
      reviewNote:
        status === "pending_review"
          ? "Заявка ожидает ручного подтверждения рабочей почты или документов."
          : "Для расширения Free нужна рабочая почта или ручная проверка.",
    },
  });
}

function normalizePlan(plan: string | null | undefined): PlanName {
  const normalized = plan?.toLowerCase();
  if (normalized === "business") return "business";
  if (normalized === "pro") return "pro";
  return "free";
}
