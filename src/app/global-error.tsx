"use client";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center gap-2 bg-cream bg-noise px-4 text-center">
        <h1 className="text-xl font-semibold text-ink">Something went wrong</h1>
        <p className="text-sm text-ink/60">
          Please try again. If this keeps happening, contact support.
        </p>
        {error.digest && <p className="text-xs text-ink/40">Reference: {error.digest}</p>}
      </body>
    </html>
  );
}
