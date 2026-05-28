import { NextResponse } from "next/server";
import { z } from "zod";
import { assertSameOrigin } from "@/server/security";
import { listWorkspaceClaims, requireAdminUser, updateWorkspaceStatus } from "@/server/admin";

const updateSchema = z.object({
  workspaceId: z.string().min(1),
  status: z.enum(["unverified", "pending_review", "verified", "rejected"]),
  note: z.string().max(500).optional(),
});

export async function GET() {
  await requireAdminUser();
  return NextResponse.json({ workspaces: await listWorkspaceClaims() });
}

export async function POST(request: Request) {
  await requireAdminUser();
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
