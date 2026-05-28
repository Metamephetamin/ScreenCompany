import { NextResponse } from "next/server";
import { z } from "zod";
import { runCompanyCheck } from "@/server/riskEngine";
import { getHistory } from "@/server/store";
import { getCurrentUserId } from "@/server/session";

const checkSchema = z.object({
  query: z.string().regex(/^\d{10,15}$/, "Введите корректный ИНН или ОГРН"),
});

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ history: await getHistory(userId) });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = checkSchema.safeParse({ query: String(body.query ?? "").replace(/\D/g, "") });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await runCompanyCheck(parsed.data.query, userId);
  if (!result) {
    return NextResponse.json(
      { error: "Контрагент с таким ИНН/ОГРН не найден в подключенных источниках" },
      { status: 404 },
    );
  }

  return NextResponse.json(result);
}
