"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportActions({ reportId }: { reportId: string; companyName: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/reports/${reportId}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function exportPdf() {
    window.print();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="secondary" onClick={copyLink}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Ссылка скопирована" : "Скопировать ссылку"}
      </Button>
      <Button type="button" variant="secondary" onClick={exportPdf}>
        <Download className="h-4 w-4" />
        Сохранить PDF
      </Button>
    </div>
  );
}
