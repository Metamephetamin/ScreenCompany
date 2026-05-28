import { Search } from "lucide-react";
import { CheckForm } from "@/components/app/check-form";
import { Disclaimer } from "@/components/app/disclaimer";
import { WorkspaceClaimForm } from "@/components/app/workspace-claim-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentUser } from "@/server/session";
import { getUserTrialSummary } from "@/server/trialLimits";

export const dynamic = "force-dynamic";

export default async function CheckPage() {
  const user = await requireCurrentUser();
  const trial = await getUserTrialSummary(user.id);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Проверка контрагента</h1>
        <p className="mt-1 text-sm text-zinc-500">Введите ИНН или ОГРН компании/ИП, чтобы получить риск-отчет.</p>
      </div>
      <WorkspaceClaimForm initialTrial={trial} />
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Search className="h-5 w-5 text-zinc-600" />
          <CardTitle>Новая проверка</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckForm />
        </CardContent>
      </Card>
      <Disclaimer />
    </div>
  );
}
