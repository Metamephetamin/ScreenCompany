import { NextResponse } from "next/server";
import { getReport } from "@/server/store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = getReport(id);
  if (!report) return NextResponse.json({ error: "Отчет не найден" }, { status: 404 });
  return NextResponse.json({ report });
}
