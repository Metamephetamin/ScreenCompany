import { NextResponse } from "next/server";
import { z } from "zod";
import { canAccessCompany, getMonitoringList, toggleMonitoring } from "@/server/store";
import { getCurrentUser } from "@/server/session";
import { assertSameOrigin } from "@/server/security";

const schema = z.object({ companyId: z.string().min(1) });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ items: await getMonitoringList(user.id) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const origin = assertSameOrigin(request);
  if (!origin.allowed) return NextResponse.json({ error: origin.error }, { status: 403 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "companyId обязателен" }, { status: 400 });
  if (!(await canAccessCompany(parsed.data.companyId, user))) {
    return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
  }
  return NextResponse.json({
    item: await toggleMonitoring(parsed.data.companyId, user.id),
  });
}
