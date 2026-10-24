import { PublicLandingPage } from "@/components/public-landing-page";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default function Page({ params }: { params: { username: string } }) {
  return <PublicLandingPage username={params.username} />;
}
