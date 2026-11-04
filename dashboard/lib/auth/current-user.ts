import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "./constants";
import { verifySessionToken } from "./session";

export async function currentUserId() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  return session?.userId ?? null;
}

export async function requireUserId() {
  const userId = await currentUserId();
  if (!userId) redirect("/login");
  return userId;
}
