import { Video, MapPin, Phone, Link2 } from "lucide-react";
import type { LocationType } from "@/lib/types";

const ICONS: Record<LocationType, typeof Video> = {
  google_meet: Video,
  in_person: MapPin,
  phone: Phone,
  custom: Link2,
};

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
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size * 2, height: size * 2, backgroundColor: color }}
    >
      <Icon size={size} className="text-white" />
    </div>
  );
}
