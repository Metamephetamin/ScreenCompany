import { redirect } from "next/navigation";

type RoleCarrier = { role?: string | null } | null;
type WorkspaceStatus = "unverified" | "pending_review" | "verified" | "rejected";

const allowedWorkspaceStatuses = new Set<WorkspaceStatus>([
  "unverified",
  "pending_review",
  "verified",
  "rejected",
]);

export function canAccessAdmin(user: RoleCarrier) {
  return user?.role === "admin";
}

export async function requireAdminUser() {
  const { getCurrentUser } = await import("@/server/session");
  const user = await getCurrentUser();
  if (!canAccessAdmin(user)) redirect("/dashboard");
  return user;
}

export async function listWorkspaceClaims() {
  const { prisma } = await import("@/server/prisma");
  const workspaces = await prisma.workspace.findMany({
    orderBy: [{ verificationStatus: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      user: { select: { email: true, createdAt: true } },
    },
  });

  return workspaces.map((workspace) => ({
    id: workspace.id,
    inn: workspace.inn,
    contactEmail: workspace.contactEmail,
    verificationStatus: workspace.verificationStatus,
    plan: workspace.plan,
    checksLimit: workspace.checksLimit,
    reviewNote: workspace.reviewNote,
    createdAt: workspace.createdAt.toISOString(),
    updatedAt: workspace.updatedAt.toISOString(),
    userEmail: workspace.user.email,
    userCreatedAt: workspace.user.createdAt.toISOString(),
  }));
}

export async function getAdminStats() {
  const { prisma } = await import("@/server/prisma");
  const [users, checks, pendingClaims, verifiedClaims] = await Promise.all([
    prisma.user.count(),
    prisma.check.count(),
    prisma.workspace.count({ where: { verificationStatus: "pending_review" } }),
    prisma.workspace.count({ where: { verificationStatus: "verified" } }),
  ]);

  return { users, checks, pendingClaims, verifiedClaims };
}

export async function updateWorkspaceStatus({
  workspaceId,
  status,
  note,
}: {
  workspaceId: string;
  status: string;
  note?: string;
}) {
  const { prisma } = await import("@/server/prisma");
  if (!allowedWorkspaceStatuses.has(status as WorkspaceStatus)) {
    throw new Error("Недопустимый статус");
  }

  const verified = status === "verified";
  return prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      verificationStatus: status,
      checksLimit: verified ? 3 : 1,
      reviewNote:
        note ??
        (verified
          ? "Организация подтверждена вручную."
          : status === "rejected"
            ? "Заявка отклонена при ручной проверке."
            : "Заявка ожидает ручного подтверждения."),
    },
  });
}
