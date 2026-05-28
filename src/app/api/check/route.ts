import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { runCompanyCheck } from "@/server/riskEngine";
import { getHistory } from "@/server/store";
import { getCurrentUserId } from "@/server/session";
import { assertSameOrigin } from "@/server/security";
import {
  createDeviceToken,
  getClientIp,
  getTrialAccess,
  getUserTrialSummary,
  hashTrialValue,
} from "@/server/trialLimits";

const checkSchema = z.object({
  query: z.string().regex(/^\d{10,15}$/, "Введите корректный ИНН или ОГРН"),
});

const trialDeviceCookie = "contragent_device";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    history: await getHistory(userId),
    trial: await getUserTrialSummary(userId),
  });
}

export async function POST(request: Request) {
  const origin = assertSameOrigin(request);
  if (!origin.allowed) return NextResponse.json({ error: origin.error }, { status: 403 });

  const body = await request.json();
  const parsed = checkSchema.safeParse({ query: String(body.query ?? "").replace(/\D/g, "") });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cookieStore = await cookies();
  const existingDeviceToken = cookieStore.get(trialDeviceCookie)?.value;
  const deviceToken = existingDeviceToken ?? createDeviceToken();
  const fingerprint = {
    clientIpHash: hashTrialValue(getClientIp(request)),
    deviceHash: hashTrialValue(deviceToken),
  };

  const access = await getTrialAccess(userId, fingerprint);
  if (!access.allowed) {
    const response = NextResponse.json(
      {
        error: access.reason,
        trial: {
          plan: access.plan,
          workspaceStatus: access.workspaceStatus,
          limit: access.limit,
          used: access.used,
          remaining: access.remaining,
        },
      },
      { status: 403 },
    );
    setDeviceCookie(response, deviceToken);
    return response;
  }

  const result = await runCompanyCheck(parsed.data.query, userId, fingerprint);
  if (!result) {
    const response = NextResponse.json(
      { error: "Контрагент с таким ИНН/ОГРН не найден в подключенных источниках" },
      { status: 404 },
    );
    setDeviceCookie(response, deviceToken);
    return response;
  }

  const response = NextResponse.json(result);
  setDeviceCookie(response, deviceToken);
  return response;
}

function setDeviceCookie(response: NextResponse, deviceToken: string) {
  response.cookies.set(trialDeviceCookie, deviceToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NEXTAUTH_URL?.startsWith("https://") ?? process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
  });
}
