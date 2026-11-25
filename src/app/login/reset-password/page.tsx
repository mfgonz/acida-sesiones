import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/server-auth";
import { AuthShell } from "@/components/auth-shell";
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
    <AuthShell title="Define una contraseña nueva" subtitle="Ingresa tu nueva contraseña para esta cuenta.">
      <form action={updatePassword} className="flex flex-col gap-[18px]">
        <label className="flex flex-col gap-2">
          <span className="lbl">Contraseña nueva</span>
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className="fld" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="lbl">Confirmar contraseña</span>
          <input name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" className="fld" />
        </label>
        {searchParams.error && (
          <p className="text-base text-terracotta">{ERROR_MESSAGES[searchParams.error] ?? ERROR_MESSAGES["1"]}</p>
        )}
        <button type="submit" className="btn btn-ink btn-lg w-full">
          Guardar contraseña
        </button>
      </form>
    </AuthShell>
  );
}
