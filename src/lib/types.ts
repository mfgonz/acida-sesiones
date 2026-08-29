export type LocationType = "google_meet" | "in_person" | "phone" | "custom";

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  timezone: string;
  google_email: string | null;
  google_connected: boolean;
  created_at: string;
}

export interface AvailabilitySchedule {
  id: string;
  user_id: string;
  name: string;
  timezone: string;
  is_default: boolean;
}

export interface AvailabilityRule {
  id: string;
  schedule_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

export interface DateOverride {
  id: string;
  schedule_id: string;
  date: string;
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
}

export interface EventType {
  id: string;
  user_id: string;
  schedule_id: string | null;
  slug: string;
  name: string;
  description: string;
  duration_minutes: number;
  location_type: LocationType;
  location_details: string;
  color: string;
  is_active: boolean;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  min_notice_minutes: number;
  booking_horizon_days: number;
  collect_project_details: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  event_type_id: string;
  user_id: string;
  invitee_name: string;
  invitee_email: string;
  invitee_notes: string;
  invitee_timezone: string;
  project_name: string | null;
  project_summary: string | null;
  start_time: string;
  end_time: string;
  status: "confirmed" | "canceled";
  google_event_id: string | null;
  meet_link: string | null;
  cancel_token: string;
  created_at: string;
}

export const LOCATION_LABELS: Record<LocationType, string> = {
  google_meet: "Google Meet",
  in_person: "In person",
  phone: "Phone call",
  custom: "Custom",
};

export const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
