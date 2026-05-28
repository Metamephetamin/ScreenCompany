import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/server/prisma";

export const appSessionCookie = "contragent_session";

const sessionMaxAgeMs = 30 * 24 * 60 * 60 * 1000;

export async function createAppSession(userId: string) {
  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + sessionMaxAgeMs);

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
    },
  });

  return { sessionToken, expires };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(appSessionCookie)?.value;
  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session || session.expires < new Date()) {
    if (session) await prisma.session.delete({ where: { sessionToken } });
    return null;
  }

  return session.user;
}

export async function getCurrentUserId() {
  return (await getCurrentUser())?.id ?? null;
}

export async function clearAppSession(sessionToken: string) {
  await prisma.session.deleteMany({ where: { sessionToken } });
}
