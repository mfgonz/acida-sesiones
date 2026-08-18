import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/server-auth";

export default async function Home() {
  const user = await getAuthUser();
  redirect(user ? "/scheduling" : "/login");
}
