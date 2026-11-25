import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/server-auth";
import { getOrCreateProfile } from "@/lib/profile";
import { Sidebar } from "@/components/sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const profile = await getOrCreateProfile(user);

  return (
    <div className="flex min-h-screen flex-col font-body text-ink md:flex-row">
      <Sidebar username={profile.username} googleConnected={profile.google_connected} />
      <main className="flex min-w-0 flex-1 flex-col gap-9 px-4 pb-[72px] pt-9 sm:px-[clamp(16px,4vw,72px)]">{children}</main>
    </div>
  );
}
