"use client";

// Catches errors thrown anywhere below the root layout (all routes except
// the root layout itself). Shows the raw message so we can diagnose
// production issues without needing server log access.
export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div style={{ padding: 24, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      <h1>Error</h1>
      <p>{error.message}</p>
      {error.digest && <p>Digest: {error.digest}</p>}
      <pre>{error.stack}</pre>
    </div>
  );
}
