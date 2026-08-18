"use client";

// Catches errors thrown by the root layout itself. Shows the raw message so
// we can diagnose production issues without needing server log access.
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html>
      <body style={{ padding: 24, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
        <h1>Global error</h1>
        <p>{error.message}</p>
        {error.digest && <p>Digest: {error.digest}</p>}
        <pre>{error.stack}</pre>
      </body>
    </html>
  );
}
