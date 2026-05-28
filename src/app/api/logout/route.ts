import { NextResponse } from "next/server";
import { appSessionCookie, clearAppSession } from "@/server/session";

export async function POST(request: Request) {
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
