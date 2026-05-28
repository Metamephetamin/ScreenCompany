import { NextResponse } from "next/server";
import { getCompanyBundle } from "@/server/riskEngine";
import { canAccessCompany, getMonitoring } from "@/server/store";
import { getCurrentUser } from "@/server/session";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!(await canAccessCompany(id, user))) {
    return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
  }
  const result = await getCompanyBundle(id);
  if (!result) return NextResponse.json({ error: "Компания не найдена" }, { status: 404 });
  return NextResponse.json({ ...result, monitoring: await getMonitoring(id, user.id) });
}
