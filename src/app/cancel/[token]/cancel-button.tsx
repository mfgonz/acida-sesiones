"use client";

import { useState } from "react";
import Link from "next/link";
import { BRAND_USERNAME } from "@/lib/brand";

export function CancelButton({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleCancel() {
    setState("loading");
    const res = await fetch("/api/bookings/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    setState(res.ok ? "done" : "error");
  }

  if (state === "done") {
    return (
      <div className="flex flex-col items-start gap-6">
        <p className="text-lg">Tu sesión fue cancelada. Te enviamos la confirmación a tu correo.</p>
        <Link href={`/${BRAND_USERNAME}`} className="btn btn-ink btn-lg">
          Agendar una nueva sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-lg">Si cancelas, la sesión se eliminará de ambos calendarios.</p>
      <button type="button" onClick={handleCancel} disabled={state === "loading"} className="btn btn-ink btn-lg">
        {state === "loading" ? "Cancelando…" : "Cancelar esta sesión"}
      </button>
      {state === "error" && <p className="text-base text-terracotta">Algo salió mal. Por favor intenta de nuevo.</p>}
    </div>
  );
}
