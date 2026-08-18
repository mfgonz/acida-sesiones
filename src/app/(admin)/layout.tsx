import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/server-auth";
import { getOrCreateProfile } from "@/lib/profile";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

function DiagnosticError({ label, err }: { label: string; err: unknown }) {
  // Temporary diagnostic: Next.js redacts thrown Server Component errors in
  // production, so render the real message directly instead of throwing.
  const e = err as Error;
  return (
    <div style={{ padding: 24, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
      <h1>{label} failed</h1>
      <p>{e?.message}</p>
      <pre>{JSON.stringify(err, Object.getOwnPropertyNames(err ?? {}), 2)}</pre>
      <pre>{e?.stack}</pre>
    </div>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await getAuthUser();
  } catch (err) {
    return <DiagnosticError label="getAuthUser" err={err} />;
  }
  if (!user) redirect("/login");

  let profile;
  try {
    profile = await getOrCreateProfile(user);
  } catch (err) {
    return <DiagnosticError label="getOrCreateProfile" err={err} />;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Topbar profile={profile} />
        <main className="mx-auto max-w-5xl px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
