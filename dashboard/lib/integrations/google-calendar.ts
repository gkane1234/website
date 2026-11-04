import { zonedTimeToISO, appTimeZone } from "../dates";
import type { Commitment } from "../domain/types";

export function isGoogleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN);
}

interface GoogleEvent {
  id?: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  recurrence?: string[];
}

/**
 * Read-only Google Calendar. This module never calls insert, update, delete,
 * or any other write endpoint.
 */
export async function listGoogleEvents(date: string, timeZone = appTimeZone()): Promise<Commitment[]> {
  if (!isGoogleConfigured()) return [];
  const accessToken = await refreshAccessToken();
  const timeMin = zonedTimeToISO(date, 0, 0, timeZone);
  const timeMax = zonedTimeToISO(date, 23, 59, timeZone);
  const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
  url.searchParams.set("timeMin", timeMin);
  url.searchParams.set("timeMax", timeMax);
  url.searchParams.set("singleEvents", "true");
  url.searchParams.set("orderBy", "startTime");
  url.searchParams.set("maxResults", "50");

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google Calendar read failed (${response.status}): ${detail.slice(0, 180)}`);
  }
  const body = (await response.json()) as { items?: GoogleEvent[] };
  const now = new Date().toISOString();
  return (body.items ?? []).map((event) => ({
    id: crypto.randomUUID(),
    userId: "",
    title: event.summary || "Busy",
    start: event.start?.dateTime || (event.start?.date ? zonedTimeToISO(event.start.date, 0, 0, timeZone) : timeMin),
    end: event.end?.dateTime || (event.end?.date ? zonedTimeToISO(event.end.date, 0, 0, timeZone) : timeMax),
    recurrence: event.recurrence?.[0] ?? null,
    source: "google" as const,
    createdAt: now,
  }));
}

async function refreshAccessToken() {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN || "",
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Google token refresh failed (${response.status}): ${detail.slice(0, 180)}`);
  }
  const body = (await response.json()) as { access_token?: string };
  if (!body.access_token) throw new Error("Google token refresh returned no access token");
  return body.access_token;
}
