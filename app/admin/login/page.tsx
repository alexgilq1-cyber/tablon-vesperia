"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError("Contraseña incorrecta");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-16">
      <div className="parchment-card p-8">
        <h1
          className="text-4xl text-stone-900"
          style={{ fontFamily: "var(--font-almendra)" }}
        >
          Acceso al Consejo
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña del Master"
            className="w-full border border-amber-950/30 bg-white/80 px-4 py-3 text-stone-900 outline-none"
            required
          />

          <button
            type="submit"
            className="border border-stone-900 bg-stone-900 px-5 py-3 text-sm uppercase tracking-[0.18em] text-amber-50"
          >
            Entrar
          </button>

          {error ? <p className="text-sm text-red-800">{error}</p> : null}
        </form>
      </div>
    </main>
  );
}
