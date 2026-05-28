"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TrialSummary = {
  plan: string;
  workspaceStatus: string;
  limit: number;
  used: number;
  remaining: number;
  workspace: {
    inn: string;
    contactEmail: string | null;
    verificationStatus: string;
    reviewNote: string | null;
  } | null;
};

export function WorkspaceClaimForm({ initialTrial }: { initialTrial: TrialSummary }) {
  const [trial, setTrial] = useState(initialTrial);
  const [inn, setInn] = useState(initialTrial.workspace?.inn ?? "");
  const [contactEmail, setContactEmail] = useState(initialTrial.workspace?.contactEmail ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const response = await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inn, contactEmail }),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Не удалось отправить заявку");
      return;
    }

    setTrial(data.trial);
    setMessage(
      data.trial.workspaceStatus === "pending_review"
        ? "Заявка отправлена на ручное подтверждение."
        : "ИНН сохранен. Для расширенного Free нужна рабочая почта или ручная проверка.",
    );
  }

  const status = trial.workspaceStatus;
  const statusView =
    status === "verified"
      ? { label: "подтверждено", icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-800" }
      : status === "pending_review"
        ? { label: "на проверке", icon: Clock3, className: "border-amber-200 bg-amber-50 text-amber-800" }
        : { label: "не подтверждено", icon: ShieldAlert, className: "border-zinc-200 bg-zinc-50 text-zinc-700" };
  const StatusIcon = statusView.icon;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div className="flex gap-3">
          <div className="rounded-md border border-zinc-200 bg-zinc-50 p-2">
            <Building2 className="h-5 w-5 text-zinc-600" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-medium text-zinc-950">Free-доступ</h2>
              <Badge className={statusView.className}>
                <StatusIcon className="mr-1 h-3.5 w-3.5" />
                {statusView.label}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              Сейчас доступно {trial.remaining} из {trial.limit} проверок. Расширенный Free на 3 проверки включается после подтверждения организации.
            </p>
          </div>
        </div>
      </div>

      {status !== "verified" && (
        <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <Input
            value={inn}
            onChange={(event) => setInn(event.target.value.replace(/\D/g, "").slice(0, 12))}
            placeholder="ИНН вашей организации"
            inputMode="numeric"
            maxLength={12}
          />
          <Input
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value.replace(/\s/g, "").toLowerCase())}
            placeholder="Рабочий email"
            inputMode="email"
            maxLength={254}
          />
          <Button type="submit" variant="secondary" disabled={loading}>
            Отправить
          </Button>
        </form>
      )}

      {(message || error || trial.workspace?.reviewNote) && (
        <p className={`mt-3 text-sm ${error ? "text-red-700" : "text-zinc-500"}`}>
          {error || message || trial.workspace?.reviewNote}
        </p>
      )}
    </section>
  );
}
