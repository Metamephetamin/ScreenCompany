"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type WorkspaceClaim = {
  id: string;
  inn: string;
  contactEmail: string | null;
  verificationStatus: string;
  checksLimit: number;
  reviewNote: string | null;
  createdAt: string;
  userEmail: string;
};

export function AdminWorkspaces({ initialItems }: { initialItems: WorkspaceClaim[] }) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState("");

  async function update(workspaceId: string, status: "verified" | "rejected") {
    setError("");
    setLoadingId(workspaceId);
    const response = await fetch("/api/admin/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId, status }),
    });
    const data = await response.json();
    setLoadingId("");
    if (!response.ok) {
      setError(data.error ?? "Не удалось обновить заявку");
      return;
    }
    setItems(data.workspaces);
  }

  return (
    <div className="space-y-3">
      {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">Заявок пока нет.</p>
      ) : (
        items.map((item) => (
          <div key={item.id} className="rounded-md border border-zinc-200 p-4">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-medium">ИНН {item.inn}</div>
                  <StatusBadge status={item.verificationStatus} />
                </div>
                <div className="mt-1 text-sm text-zinc-500">
                  Пользователь: {item.userEmail} · Рабочая почта: {item.contactEmail ?? "не указана"}
                </div>
                {item.reviewNote && <div className="mt-2 text-sm text-zinc-600">{item.reviewNote}</div>}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => update(item.id, "verified")}
                  disabled={loadingId === item.id}
                >
                  <Check className="h-4 w-4" />
                  Подтвердить
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => update(item.id, "rejected")}
                  disabled={loadingId === item.id}
                >
                  <X className="h-4 w-4" />
                  Отклонить
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "verified"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "pending_review"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : status === "rejected"
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-zinc-200 bg-zinc-50 text-zinc-700";
  const label =
    status === "verified"
      ? "подтверждено"
      : status === "pending_review"
        ? "на проверке"
        : status === "rejected"
          ? "отклонено"
          : "не подтверждено";
  return <Badge className={className}>{label}</Badge>;
}
