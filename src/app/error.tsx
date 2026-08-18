"use client";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center">
      <h1 className="text-xl font-semibold text-white">Something went wrong</h1>
      <p className="text-sm text-neutral-400">
        Please try again. If this keeps happening, contact support.
      </p>
      {error.digest && <p className="text-xs text-neutral-600">Reference: {error.digest}</p>}
    </div>
  );
}
