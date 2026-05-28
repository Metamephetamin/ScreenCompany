"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeEmailInput, stripWhitespace } from "@/lib/credentials";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@risk.local");
  const [password, setPassword] = useState("password123");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const sanitizedEmail = normalizeEmailInput(stripWhitespace(email));
    const sanitizedPassword = stripWhitespace(password);
    setEmail(sanitizedEmail);
    setPassword(sanitizedPassword);

    if (mode === "register") {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Не удалось зарегистрироваться");
        return;
      }
    }

    const loginResponse = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword }),
    });
    if (!loginResponse.ok) {
      const data = await loginResponse.json();
      setError(data.error ?? "Неверный email или пароль");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 rounded-md border border-zinc-200 bg-zinc-50 p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`rounded px-3 py-2 text-sm font-medium ${mode === "login" ? "bg-white shadow-sm" : "text-zinc-500"}`}
        >
          Вход
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`rounded px-3 py-2 text-sm font-medium ${mode === "register" ? "bg-white shadow-sm" : "text-zinc-500"}`}
        >
          Регистрация
        </button>
      </div>
      <label className="block space-y-1 text-sm font-medium">
        Email
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <Input
            value={email}
            onChange={(event) => setEmail(stripWhitespace(event.target.value))}
            className="pl-9"
            autoComplete="email"
            inputMode="email"
            maxLength={254}
          />
        </div>
      </label>
      <label className="block space-y-1 text-sm font-medium">
        Пароль
        <div className="relative">
          <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(stripWhitespace(event.target.value))}
            className="pl-9"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={8}
            maxLength={128}
          />
        </div>
      </label>
      {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <Button type="submit" className="w-full">
        {mode === "login" ? "Войти" : "Создать аккаунт"}
      </Button>
    </form>
  );
}
