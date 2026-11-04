import { Button, Card, Field } from "@/components/ui";

export const metadata = { title: "Log in" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <Card className="w-full max-w-md p-8">
        <p className="eyebrow">Local session</p>
        <h1 className="mt-2 font-display text-4xl text-ink">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          One user on this machine. The password is <span className="text-ink">DEV_AUTH_PASSWORD</span> from the
          environment.
        </p>
        {searchParams.error ? (
          <p className="mt-4 rounded-2xl bg-claybg px-3 py-2 text-sm text-clay" role="alert">
            That password did not match.
          </p>
        ) : null}
        <form action="/api/auth/login" method="post" className="mt-6 space-y-4">
          <Field label="Password">
            <input className="field" type="password" name="password" autoComplete="current-password" required />
          </Field>
          <Button type="submit" className="w-full">
            Enter
          </Button>
        </form>
      </Card>
    </main>
  );
}
