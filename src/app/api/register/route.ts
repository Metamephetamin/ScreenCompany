import { NextResponse } from "next/server";
import { registerUser } from "@/server/store";
import { consumeRateLimit, rateLimitKey, registerSchema } from "@/server/security";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const rawEmail =
    typeof body === "object" && body !== null && "email" in body ? String(body.email) : "unknown";
  const limiter = consumeRateLimit(rateLimitKey("register", rawEmail), 5, 15 * 60 * 1000);
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Слишком много попыток. Попробуйте позже." },
      { status: 429 },
    );
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Введите email без пробелов и пароль от 8 символов с буквой и цифрой" },
      { status: 400 },
    );
  }
  const user = registerUser(parsed.data.email, parsed.data.password);
  if (!user) return NextResponse.json({ error: "Пользователь уже существует" }, { status: 409 });
  return NextResponse.json({ user: { email: user.email, name: user.name } });
}
