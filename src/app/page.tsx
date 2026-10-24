import { PublicLandingPage } from "@/components/public-landing-page";
import { BRAND_USERNAME } from "@/lib/brand";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export default function Home() {
  return <PublicLandingPage username={BRAND_USERNAME} />;
}
