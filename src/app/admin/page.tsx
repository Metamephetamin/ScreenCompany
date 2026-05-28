import { ShieldCheck, Users, FileSearch, Clock3 } from "lucide-react";
import { AdminWorkspaces } from "@/components/app/admin-workspaces";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminStats, listWorkspaceClaims, requireAdminUser } from "@/server/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdminUser();
  const [stats, workspaces] = await Promise.all([getAdminStats(), listWorkspaceClaims()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Админка</h1>
        <p className="mt-1 text-sm text-zinc-500">Ручная проверка Free-заявок и контроль доступа.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={Users} label="Пользователей" value={stats.users} />
        <Metric icon={FileSearch} label="Проверок" value={stats.checks} />
        <Metric icon={Clock3} label="На проверке" value={stats.pendingClaims} />
        <Metric icon={ShieldCheck} label="Подтверждено" value={stats.verifiedClaims} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Заявки организаций</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminWorkspaces initialItems={workspaces} />
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <div className="text-sm text-zinc-500">{label}</div>
          <div className="mt-1 text-2xl font-semibold">{value}</div>
        </div>
        <Icon className="h-5 w-5 text-zinc-600" />
      </CardContent>
    </Card>
  );
}
