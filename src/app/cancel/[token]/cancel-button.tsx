"use client";

import { useState } from "react";

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
    return <p className="mt-4 text-sm text-green-400">Your booking has been canceled.</p>;
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleCancel}
        disabled={state === "loading"}
        className="rounded-lg border border-red-500/50 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-60"
      >
        {state === "loading" ? "Canceling…" : "Cancel this booking"}
      </button>
      {state === "error" && <p className="mt-2 text-sm text-red-400">Something went wrong. Please try again.</p>}
    </div>
  );
}
