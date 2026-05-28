import { NextResponse } from "next/server";
import { getReportForUser } from "@/server/store";
import { getCurrentUser } from "@/server/session";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const report = await getReportForUser(id, user);
  if (!report) return NextResponse.json({ error: "Отчет не найден" }, { status: 404 });
  return NextResponse.json({ report });
}
