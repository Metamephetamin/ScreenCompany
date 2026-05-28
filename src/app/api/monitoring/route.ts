import { NextResponse } from "next/server";
import { z } from "zod";
import { getMonitoringList, toggleMonitoring } from "@/server/store";
import { getCurrentUserId } from "@/server/session";

const schema = z.object({ companyId: z.string().min(1) });

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ items: await getMonitoringList(userId) });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "companyId обязателен" }, { status: 400 });
  return NextResponse.json({
    item: await toggleMonitoring(parsed.data.companyId, userId),
  });
}
