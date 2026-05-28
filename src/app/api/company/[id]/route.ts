import { NextResponse } from "next/server";
import { getCompanyBundle } from "@/server/riskEngine";
import { getMonitoring } from "@/server/store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getCompanyBundle(id);
  if (!result) return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
  return NextResponse.json({ ...result, monitoring: getMonitoring(id) });
}
