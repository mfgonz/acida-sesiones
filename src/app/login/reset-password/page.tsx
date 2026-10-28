import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/server-auth";
import { updatePassword } from "./actions";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  short: "La contraseña debe tener al menos 8 caracteres.",
  mismatch: "Las contraseñas no coinciden.",
  "1": "No se pudo actualizar la contraseña. Intenta de nuevo.",
};

export default async function ResetPasswordPage({ searchParams }: { searchParams: { error?: string } }) {
  const user = await getAuthUser();
  if (!user) redirect("/login/forgot-password?expired=1");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-white/80 p-8 shadow-lg backdrop-blur">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-semibold text-cream">
            A
          </div>
          <span className="font-display text-lg font-bold text-ink">ACIDA</span>
        </div>
        <h1 className="mb-1 text-xl font-semibold text-ink">Define una contraseña nueva</h1>
        <p className="mb-6 text-sm text-ink/60">Ingresa tu nueva contraseña para esta cuenta.</p>
        <form action={updatePassword} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-ink/70">Contraseña nueva</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full rounded-lg border border-ink/15 bg-cream/40 px-3 py-2 text-sm text-ink outline-none focus:border-terracotta"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink/70">Confirmar contraseña</label>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="w-full rounded-lg border border-ink/15 bg-cream/40 px-3 py-2 text-sm text-ink outline-none focus:border-terracotta"
            />
          </div>
          {searchParams.error && (
            <p className="text-sm text-red-600">{ERROR_MESSAGES[searchParams.error] ?? ERROR_MESSAGES["1"]}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-[6px] bg-ink px-4 py-2.5 font-medium text-cream transition hover:bg-terracotta"
          >
            Guardar contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
