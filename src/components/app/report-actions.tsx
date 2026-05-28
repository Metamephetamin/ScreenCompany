"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";

export function ReportActions({ reportId, companyName }: { reportId: string; companyName: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/reports/${reportId}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function exportPdf() {
    const pdf = new jsPDF();
    pdf.setFont("helvetica", "normal");
    pdf.text("Kontragent Risk Report", 16, 18);
    pdf.text(companyName, 16, 30);
    pdf.text(`Report ID: ${reportId}`, 16, 42);
    pdf.text("Full Russian report is available on the web page.", 16, 54);
    pdf.save(`${reportId}.pdf`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="secondary" onClick={copyLink}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? "Ссылка скопирована" : "Скопировать ссылку"}
      </Button>
      <Button type="button" variant="secondary" onClick={exportPdf}>
        <Download className="h-4 w-4" />
        Экспорт PDF
      </Button>
    </div>
  );
}
