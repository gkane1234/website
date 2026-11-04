"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/projects", label: "Projects" },
  { href: "/inbox", label: "Inbox" },
  { href: "/schedule", label: "Schedule" },
  { href: "/assistant", label: "Assistant" },
];

export function Nav({ proposalCount }: { proposalCount: number }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-4 pt-6">
        <p className="eyebrow">Productivity</p>
        <p className="font-display text-3xl leading-none text-ink">Dashboard</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-col md:overflow-visible">
        {LINKS.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between rounded-full px-3 py-2 text-sm whitespace-nowrap transition ${
                active ? "bg-ink text-paper" : "text-ink hover:bg-sand"
              }`}
            >
              <span>{link.label}</span>
              {link.href === "/assistant" && proposalCount > 0 ? (
                <span className={`ml-2 rounded-full px-1.5 text-xs ${active ? "bg-paper text-ink" : "bg-claybg text-clay"}`}>
                  {proposalCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <form action="/api/auth/logout" method="post" className="mt-auto px-5 py-5">
        <button className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline" type="submit">
          Log out
        </button>
      </form>
    </div>
  );
}
