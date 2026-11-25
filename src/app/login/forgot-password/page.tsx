import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { sent?: string; expired?: string };
}) {
  if (searchParams.sent) {
    return (
      <AuthShell
        title="Revisa tu correo"
        subtitle="Si existe una cuenta con ese correo, te enviamos un link para definir una contraseña nueva."
      >
        <Link href="/login" className="btn btn-ink btn-lg w-full">
          Volver a iniciar sesión
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="¿Olvidaste tu contraseña?"
      subtitle="Ingresa tu correo y te enviamos un link para definir una contraseña nueva."
    >
      {searchParams.expired && (
        <p className="text-base text-terracotta">Ese link ya expiró o ya se usó. Solicita uno nuevo.</p>
      )}
      <form action={requestPasswordReset} className="flex flex-col gap-[18px]">
        <label className="flex flex-col gap-2">
          <span className="lbl">Correo</span>
          <input name="email" type="email" required autoComplete="email" className="fld" />
        </label>
        <button type="submit" className="btn btn-ink btn-lg w-full">
          Enviar link
        </button>
      </form>
      <Link href="/login" className="lbl self-center text-olive underline-offset-4 hover:underline">
        Volver a iniciar sesión
      </Link>
    </AuthShell>
  );
}
