import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { signIn } from "./actions";

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <AuthShell title="Iniciar sesión" subtitle="Gestiona tus sesiones y disponibilidad.">
      <form action={signIn} className="flex flex-col gap-[18px]">
        <label className="flex flex-col gap-2">
          <span className="lbl">Correo</span>
          <input name="email" type="email" required autoComplete="email" className="fld" />
        </label>
        <label className="flex flex-col gap-2">
          <span className="flex items-center justify-between gap-3">
            <span className="lbl">Contraseña</span>
            <Link href="/login/forgot-password" className="lbl text-olive underline-offset-4 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </span>
          <input name="password" type="password" required autoComplete="current-password" className="fld" />
        </label>
        {searchParams.error && <p className="text-base text-terracotta">Correo o contraseña incorrectos.</p>}
        <button type="submit" className="btn btn-ink btn-lg w-full">
          Entrar
        </button>
      </form>
    </AuthShell>
  );
}
