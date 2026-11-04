"use client";

export default function MainError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="max-w-lg rounded-3xl border border-line bg-card p-8">
      <p className="eyebrow">Error</p>
      <h1 className="mt-2 font-display text-4xl">This page did not load</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{error.message || "Something went wrong reading your data."}</p>
      <button className="mt-6 rounded-full bg-ink px-4 py-2 text-sm text-paper" type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
