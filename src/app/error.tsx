"use client";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="text-xl font-semibold text-ink">Algo salió mal</h1>
      <p className="text-sm text-ink/60">
        Por favor intenta de nuevo. Si sigue pasando, escríbenos.
      </p>
      {error.digest && <p className="text-xs text-ink/40">Referencia: {error.digest}</p>}
    </div>
  );
}
