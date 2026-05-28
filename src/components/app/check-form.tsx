"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CheckForm() {
  const router = useRouter();
  const [query, setQuery] = useState("7707083893");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const response = await fetch("/api/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Не удалось выполнить проверку");
      return;
    }

    router.push(`/company/${data.company.id}?report=${data.report.id}`);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Введите ИНН или ОГРН"
          inputMode="numeric"
          className="h-12 text-base"
        />
        <Button type="submit" disabled={loading} className="h-12 md:w-44">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Проверить
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 text-sm text-zinc-500">
        Примеры ИНН:
        {["7707083893", "7736050003", "7704217370", "7736207543", "7721503606"].map(
          (inn) => (
            <button
              key={inn}
              type="button"
              onClick={() => setQuery(inn)}
              className="rounded border border-zinc-200 bg-white px-2 py-1 font-mono text-xs text-zinc-700 hover:bg-zinc-50"
            >
              {inn}
            </button>
          ),
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}
    </form>
  );
}
