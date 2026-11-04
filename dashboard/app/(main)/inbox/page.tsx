import { Badge, Button, Card, Field, Flash } from "@/components/ui";
import { captureInboxAction } from "@/lib/actions";
import { requireUserId } from "@/lib/auth/current-user";
import { formatDateTime } from "@/lib/dates";
import { one } from "@/lib/search";
import { services } from "@/lib/services";

export const metadata = { title: "Inbox" };

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const userId = await requireUserId();
  const items = await services().inbox.list(userId);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Capture</p>
        <h1 className="mt-2 font-display text-4xl">Inbox</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          Drop a line of text. This page only captures it. Sorting it into a task is a later decision, or a proposal
          from the assistant.
        </p>
      </div>
      <Flash error={one(searchParams.error)} notice={one(searchParams.notice)} />
      <Card className="p-5">
        <form action={captureInboxAction} className="space-y-3">
          <Field label="Text">
            <textarea className="field min-h-28" name="body" required placeholder="Something to remember" />
          </Field>
          <Button type="submit">Capture</Button>
        </form>
      </Card>
      <div className="space-y-3">
        {items.length === 0 ? <p className="text-sm text-muted">Nothing captured yet.</p> : null}
        {items.map((item) => (
          <Card key={item.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm leading-6">{item.body}</p>
              <Badge value={item.status} />
            </div>
            <p className="mt-2 text-xs text-muted">{formatDateTime(item.capturedAt)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
