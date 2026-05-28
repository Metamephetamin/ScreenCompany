import { NextResponse } from "next/server";
import { appSessionCookie, createAppSession } from "@/server/session";
import { findUser } from "@/server/store";
import { consumeRateLimit, credentialsSchema, rateLimitKey } from "@/server/security";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const parsed = credentialsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
  }

  const limiter = consumeRateLimit(rateLimitKey("login", parsed.data.email), 8, 15 * 60 * 1000);
  if (!limiter.allowed) {
    return NextResponse.json({ error: "Слишком много попыток. Попробуйте позже." }, { status: 429 });
  }

  const user = await findUser(parsed.data.email, parsed.data.password);
  if (!user) {
    return NextResponse.json({ error: "Неверный email или пароль" }, { status: 401 });
  }

  const session = await createAppSession(user.id);
  const response = NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name },
  });

  response.cookies.set(appSessionCookie, session.sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: session.expires,
    path: "/",
  });

  return response;
}
