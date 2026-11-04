import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "paper" }) {
  const styles = {
    primary: "bg-ink text-paper hover:bg-pine",
    paper: "bg-white text-ink border border-line hover:border-ink",
    ghost: "bg-transparent text-ink hover:bg-sand",
    danger: "bg-transparent text-clay border border-clay/30 hover:bg-claybg",
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine disabled:opacity-50 ${styles} ${className}`}
    />
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-line bg-card shadow-card ${className}`}>{children}</section>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

export function Flash({ error, notice }: { error?: string; notice?: string }) {
  if (!error && !notice) return null;
  if (error) {
    return (
      <p className="rounded-2xl border border-clay/20 bg-claybg px-4 py-3 text-sm text-clay" role="alert">
        {error}
      </p>
    );
  }
  return (
    <p className="rounded-2xl border border-pine/15 bg-moss px-4 py-3 text-sm text-pine" role="status">
      {notice}
    </p>
  );
}

const BADGE: Record<string, string> = {
  high: "bg-claybg text-clay",
  medium: "bg-[#f6edd9] text-amber",
  low: "bg-moss text-pine",
  active: "bg-moss text-pine",
  paused: "bg-sand text-muted",
  done: "bg-sand text-muted",
  completed: "bg-sand text-muted",
  ready: "bg-moss text-pine",
  in_progress: "bg-ink text-paper",
  blocked: "bg-claybg text-clay",
  inbox: "bg-sand text-ink",
  new: "bg-moss text-pine",
  processed: "bg-sand text-muted",
  discarded: "bg-sand text-muted",
  proposed: "bg-[#f6edd9] text-amber",
  approved: "bg-moss text-pine",
  rejected: "bg-sand text-muted",
  executed: "bg-moss text-pine",
  app: "bg-sand text-ink",
  google: "bg-[#e7eef8] text-[#23406e]",
};

export function Badge({ value, label }: { value: string; label?: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE[value] ?? "bg-sand text-ink"}`}>
      {label ?? value}
    </span>
  );
}

export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line px-5 py-8">
      <p className="font-display text-2xl text-ink">{title}</p>
      <p className="mt-2 max-w-md text-sm text-muted">{body}</p>
    </div>
  );
}
