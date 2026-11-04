import { Nav } from "@/components/nav";
import { requireUserId } from "@/lib/auth/current-user";
import { services } from "@/lib/services";

export const dynamic = "force-dynamic";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const userId = await requireUserId();
  const proposals = await services().agent.listActions(userId, "proposed");
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-line bg-card/80 md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
        <Nav proposalCount={proposals.length} />
      </aside>
      <div className="min-w-0">
        <main className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
