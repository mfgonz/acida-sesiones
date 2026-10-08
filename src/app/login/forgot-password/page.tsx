import Link from "next/link";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { sent?: string; expired?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-white/80 p-8 shadow-lg backdrop-blur">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-semibold text-cream">
            A
          </div>
          <span className="font-display text-lg font-bold text-ink">ACIDA</span>
        </div>

        {searchParams.sent ? (
          <>
            <h1 className="mb-1 text-xl font-semibold text-ink">Revisa tu correo</h1>
            <p className="mb-6 text-sm text-ink/60">
              Si existe una cuenta con ese correo, te enviamos un link para definir una contraseña nueva.
            </p>
            <Link
              href="/login"
              className="block w-full rounded-lg bg-ink px-4 py-2.5 text-center font-medium text-cream transition hover:bg-terracotta"
            >
              Volver a iniciar sesión
            </Link>
          </>
        ) : (
          <>
            <h1 className="mb-1 text-xl font-semibold text-ink">¿Olvidaste tu contraseña?</h1>
            <p className="mb-6 text-sm text-ink/60">
              Ingresa tu correo y te enviamos un link para definir una contraseña nueva.
            </p>
            {searchParams.expired && (
              <p className="mb-4 text-sm text-red-600">
                Ese link ya expiró o ya se usó. Solicita uno nuevo.
              </p>
            )}
            <form action={requestPasswordReset} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-ink/70">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-lg border border-ink/15 bg-cream/40 px-3 py-2 text-sm text-ink outline-none focus:border-terracotta"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-ink px-4 py-2.5 font-medium text-cream transition hover:bg-terracotta"
              >
                Enviar link
              </button>
            </form>
            <Link href="/login" className="mt-4 block text-center text-sm text-ink/60 hover:text-ink">
              Volver a iniciar sesión
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
