import { NextResponse } from "next/server";
import { appSessionCookie, clearAppSession } from "@/server/session";
import { assertSameOrigin } from "@/server/security";

export async function POST(request: Request) {
  const origin = assertSameOrigin(request);
  if (!origin.allowed) return NextResponse.json({ error: origin.error }, { status: 403 });

  const sessionToken = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${appSessionCookie}=`))
    ?.split("=")[1];

  if (sessionToken) await clearAppSession(sessionToken);

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(appSessionCookie);
  return response;
}
