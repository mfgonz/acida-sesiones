import { Video, MapPin, Phone, Link2 } from "lucide-react";
import type { LocationType } from "@/lib/types";

const ICONS: Record<LocationType, typeof Video> = {
  google_meet: Video,
  in_person: MapPin,
  phone: Phone,
  custom: Link2,
};

/** WCAG relative luminance, used to pick a readable icon color for any background. */
function relativeLuminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [rl, gl, bl] = [r, g, b].map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

export function LocationIcon({
  locationType,
  color,
  size = 20,
}: {
  locationType: LocationType;
  color: string;
  size?: number;
}) {
  const Icon = ICONS[locationType];
  const iconColor = relativeLuminance(color) > 0.5 ? "#191919" : "#ffffff";
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size * 2, height: size * 2, backgroundColor: color }}
    >
      <Icon size={size} color={iconColor} />
    </div>
  );
}
