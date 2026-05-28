import { NextResponse } from "next/server";
import { z } from "zod";
import { getMonitoringList, toggleMonitoring } from "@/server/store";

const schema = z.object({ companyId: z.string().min(1) });

export async function GET() {
  return NextResponse.json({ items: getMonitoringList() });
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "companyId обязателен" }, { status: 400 });
  return NextResponse.json({ item: toggleMonitoring(parsed.data.companyId) });
}
