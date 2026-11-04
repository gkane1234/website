export function appTimeZone() {
  return process.env.APP_TIMEZONE || "America/New_York";
}

export function todayISO(now = new Date(), timeZone = appTimeZone()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function addDays(isoDate: string, days: number) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day!));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function timeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - date.getTime();
}

/** UTC instant for a wall-clock time on a calendar date in `timeZone`. */
export function zonedTimeToISO(dateISO: string, hour: number, minute: number, timeZone = appTimeZone()) {
  const [year, month, day] = dateISO.split("-").map(Number);
  const wallAsUtc = Date.UTC(year!, month! - 1, day!, hour, minute, 0);
  let guess = new Date(wallAsUtc);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const next = new Date(wallAsUtc - timeZoneOffsetMs(guess, timeZone));
    if (next.getTime() === guess.getTime()) break;
    guess = next;
  }
  return guess.toISOString();
}

export function formatLongDate(isoDate: string, timeZone = appTimeZone()) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(Date.UTC(year!, month! - 1, day!, 12)));
}

export function formatShortDate(isoDate: string, timeZone = appTimeZone()) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
  }).format(new Date(Date.UTC(year!, month! - 1, day!, 12)));
}

export function formatDue(isoDate: string | null, today: string) {
  if (!isoDate) return null;
  if (isoDate === today) return "Today";
  if (isoDate === addDays(today, -1)) return "Yesterday";
  if (isoDate === addDays(today, 1)) return "Tomorrow";
  return formatShortDate(isoDate);
}

export function formatTime(iso: string, timeZone = appTimeZone()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string, timeZone = appTimeZone()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function isDateISO(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Wall-clock value for a datetime-local input in `timeZone`. */
export function isoToLocalInput(iso: string | null, timeZone = appTimeZone()) {
  if (!iso) return "";
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
      .formatToParts(new Date(iso))
      .map((part) => [part.type, part.value]),
  );
  const hour = parts.hour === "24" ? "00" : parts.hour;
  return `${parts.year}-${parts.month}-${parts.day}T${hour}:${parts.minute}`;
}

/** Accepts an ISO timestamp or a datetime-local value and returns an ISO instant. */
export function localInputToISO(value: string | null, timeZone = appTimeZone()) {
  if (!value) return null;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
  if (!match) return value;
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(value)) return new Date(value).toISOString();
  return zonedTimeToISO(match[1]!, Number(match[2]), Number(match[3]), timeZone);
}
