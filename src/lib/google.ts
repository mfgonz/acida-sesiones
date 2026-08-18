import { google } from "googleapis";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
  "https://www.googleapis.com/auth/userinfo.email",
];

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function getGoogleAuthUrl(state: string) {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_SCOPES,
    state,
  });
}

/** Returns an authenticated OAuth2 client for the given admin user, or null if not connected. */
async function getClientForUser(userId: string) {
  const admin = supabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("google_refresh_token, google_connected")
    .eq("id", userId)
    .maybeSingle();

  if (!profile?.google_connected || !profile.google_refresh_token) return null;

  const client = getOAuthClient();
  client.setCredentials({ refresh_token: profile.google_refresh_token });
  return client;
}

export interface BusyInterval {
  start: string;
  end: string;
}

/** Queries Google Calendar free/busy for the admin's primary calendar. */
export async function getBusyIntervals(
  userId: string,
  timeMin: string,
  timeMax: string
): Promise<BusyInterval[]> {
  const client = await getClientForUser(userId);
  if (!client) return [];

  const calendar = google.calendar({ version: "v3", auth: client });
  const res = await calendar.freebusy.query({
    requestBody: { timeMin, timeMax, items: [{ id: "primary" }] },
  });

  return (res.data.calendars?.primary?.busy ?? []) as BusyInterval[];
}

export interface CreateEventParams {
  userId: string;
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
  attendeeEmail: string;
  attendeeName: string;
  useGoogleMeet: boolean;
  location?: string;
}

export interface CreatedEvent {
  googleEventId: string;
  meetLink: string | null;
}

/** Creates an event on the admin's primary calendar and invites the booker (Google sends the invite email + reminders automatically). */
export async function createCalendarEvent(params: CreateEventParams): Promise<CreatedEvent | null> {
  const client = await getClientForUser(params.userId);
  if (!client) return null;

  const calendar = google.calendar({ version: "v3", auth: client });

  const res = await calendar.events.insert({
    calendarId: "primary",
    sendUpdates: "all",
    conferenceDataVersion: params.useGoogleMeet ? 1 : 0,
    requestBody: {
      summary: params.summary,
      description: params.description,
      location: params.location,
      start: { dateTime: params.startTime },
      end: { dateTime: params.endTime },
      attendees: [{ email: params.attendeeEmail, displayName: params.attendeeName }],
      ...(params.useGoogleMeet
        ? {
            conferenceData: {
              createRequest: {
                requestId: `acida-${Date.now()}`,
                conferenceSolutionKey: { type: "hangoutsMeet" },
              },
            },
          }
        : {}),
    },
  });

  return {
    googleEventId: res.data.id ?? "",
    meetLink: res.data.hangoutLink ?? null,
  };
}

export async function deleteCalendarEvent(userId: string, googleEventId: string) {
  const client = await getClientForUser(userId);
  if (!client) return;

  const calendar = google.calendar({ version: "v3", auth: client });
  try {
    await calendar.events.delete({ calendarId: "primary", eventId: googleEventId, sendUpdates: "all" });
  } catch (err: any) {
    // Event may already be gone (deleted manually in Google Calendar) — not fatal.
    if (err?.code !== 404 && err?.code !== 410) throw err;
  }
}

export async function getGoogleEmail(accessToken: string): Promise<string | null> {
  const client = getOAuthClient();
  client.setCredentials({ access_token: accessToken });
  const res = await google.oauth2({ version: "v2", auth: client }).userinfo.get();
  return res.data.email ?? null;
}
