import { NextResponse } from "next/server";
import { z } from "zod";
import { assertSameOrigin } from "@/server/security";
import { canAccessAdmin, listWorkspaceClaims, updateWorkspaceStatus } from "@/server/admin";
import { getCurrentUser } from "@/server/session";

const updateSchema = z.object({
  workspaceId: z.string().min(1),
  status: z.enum(["unverified", "pending_review", "verified", "rejected"]),
  note: z.string().max(500).optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAccessAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ workspaces: await listWorkspaceClaims() });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAccessAdmin(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const origin = assertSameOrigin(request);
  if (!origin.allowed) return NextResponse.json({ error: origin.error }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }

  await updateWorkspaceStatus(parsed.data);
  return NextResponse.json({ workspaces: await listWorkspaceClaims() });
}
