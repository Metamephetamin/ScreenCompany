import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/server/session";
import { getUserTrialSummary, upsertWorkspaceClaim } from "@/server/trialLimits";

const workspaceSchema = z.object({
  inn: z.string().transform((value) => value.replace(/\D/g, "")).pipe(z.string().regex(/^(\d{10}|\d{12})$/, "Введите ИНН вашей организации или ИП")),
  contactEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email("Введите рабочий email")
    .max(254)
    .optional()
    .or(z.literal("")),
});

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ trial: await getUserTrialSummary(userId) });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const parsed = workspaceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  await upsertWorkspaceClaim({
    userId,
    inn: parsed.data.inn,
    contactEmail: parsed.data.contactEmail || undefined,
  });

  return NextResponse.json({ trial: await getUserTrialSummary(userId) });
}
