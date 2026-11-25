"use client";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html lang="es">
      <body
        className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center"
        style={{ backgroundColor: "#F7F7EF", color: "#2B2B27" }}
      >
        <h1 className="text-xl font-semibold text-ink">Algo salió mal</h1>
        <p className="text-sm text-ink/60">
          Por favor intenta de nuevo. Si sigue pasando, escríbenos.
        </p>
        {error.digest && <p className="text-xs text-ink/40">Referencia: {error.digest}</p>}
      </body>
    </html>
  );
}
