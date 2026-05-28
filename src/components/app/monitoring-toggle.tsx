"use client";

import { useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MonitoringItem } from "@/lib/types";

export function MonitoringToggle({
  companyId,
  initial,
}: {
  companyId: string;
  initial: MonitoringItem;
}) {
  const [item, setItem] = useState(initial);
  const [loading, setLoading] = useState(false);
  const enabled = item.status === "в мониторинге";

  async function toggle() {
    setLoading(true);
    const response = await fetch("/api/monitoring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId }),
    });
    const data = await response.json();
    setItem(data.item);
    setLoading(false);
  }

  return (
    <Button type="button" variant={enabled ? "secondary" : "primary"} onClick={toggle} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : enabled ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      {enabled ? "В мониторинге" : "Добавить в мониторинг"}
    </Button>
  );
}
