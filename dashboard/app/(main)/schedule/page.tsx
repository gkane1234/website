import Link from "next/link";
import { Badge, Button, Card, Field, Flash } from "@/components/ui";
import { createCommitmentAction, deleteCommitmentAction, suggestFocusBlockAction } from "@/lib/actions";
import { requireUserId } from "@/lib/auth/current-user";
import { addDays, formatLongDate, formatTime, isDateISO, todayISO, zonedTimeToISO } from "@/lib/dates";
import { one } from "@/lib/search";
import { readGoogleDay, services } from "@/lib/services";

export const metadata = { title: "Schedule" };

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const userId = await requireUserId();
  const today = todayISO();
  const requested = one(searchParams.date);
  const date = requested && isDateISO(requested) ? requested : today;
  const dayStart = zonedTimeToISO(date, 0, 0);
  const dayEnd = zonedTimeToISO(date, 23, 59);
  const [commitments, google] = await Promise.all([
    services().commitments.list(userId, { from: dayStart, to: dayEnd }),
    readGoogleDay(date),
  ]);
  const returnTo = `/schedule?date=${date}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Time</p>
          <h1 className="mt-2 font-display text-4xl">{formatLongDate(date)}</h1>
        </div>
        <div className="flex gap-2 text-sm">
          <Link className="rounded-full border border-line px-3 py-2" href={`/schedule?date=${addDays(date, -1)}`}>
            Previous
          </Link>
          <Link className="rounded-full border border-line px-3 py-2" href="/schedule">
            Today
          </Link>
          <Link className="rounded-full border border-line px-3 py-2" href={`/schedule?date=${addDays(date, 1)}`}>
            Next
          </Link>
        </div>
      </div>
      <Flash error={one(searchParams.error)} notice={one(searchParams.notice)} />
      <p className="text-sm text-muted">
        Suggestions become proposals. Nothing on this page writes to Google Calendar. Times use the app timezone.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="eyebrow">Commitments</p>
          {commitments.length === 0 ? <p className="mt-3 text-sm text-muted">No saved commitments this day.</p> : null}
          <ul className="mt-3 space-y-3">
            {commitments.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 border-b border-line pb-3 last:border-0">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted">
                    {formatTime(item.start)} – {formatTime(item.end)}
                    {item.recurrence ? ` · ${item.recurrence}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge value={item.source} />
                  {item.source === "app" ? (
                    <form action={deleteCommitmentAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="returnTo" value={returnTo} />
                      <button className="text-xs text-clay" type="submit">
                        Remove
                      </button>
                    </form>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <p className="eyebrow">Google Calendar</p>
          {!google.connected ? (
            <div className="mt-4 rounded-2xl border border-dashed border-line px-4 py-6">
              <p className="font-medium">Google Calendar not connected</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN to show a read-only day. Events stay
                on Google. This app does not write them.
              </p>
            </div>
          ) : google.error ? (
            <p className="mt-3 text-sm text-clay" role="alert">
              {google.error}
            </p>
          ) : google.events.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Connected. No events in this window.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {google.events.map((event) => (
                <li key={event.id}>
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-muted">
                    {formatTime(event.start)} – {formatTime(event.end)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card className="p-5">
          <p className="eyebrow">Add a commitment</p>
          <form action={createCommitmentAction} className="mt-4 grid gap-3 md:grid-cols-2">
            <input type="hidden" name="returnTo" value={returnTo} />
            <div className="md:col-span-2">
              <Field label="Title">
                <input className="field" name="title" required placeholder="Office hours" />
              </Field>
            </div>
            <Field label="Start">
              <input className="field" type="datetime-local" name="start" required defaultValue={`${date}T11:00`} />
            </Field>
            <Field label="End">
              <input className="field" type="datetime-local" name="end" required defaultValue={`${date}T12:00`} />
            </Field>
            <Field label="Recurrence (optional)">
              <input className="field" name="recurrence" placeholder="weekly" />
            </Field>
            <div className="flex items-end">
              <Button type="submit">Save in the app</Button>
            </div>
          </form>
        </Card>
        <Card className="p-5">
          <p className="eyebrow">Suggestion</p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Propose a focus block in the next free gap. It lands in the approval list and does not change the calendar.
          </p>
          <form action={suggestFocusBlockAction} className="mt-4">
            <Button type="submit" variant="paper">
              Propose a focus block
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
