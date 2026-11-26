import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import AppShell from "@/components/AppShell";
import { getCurrentUser } from "@/lib/currentUser";
import { ROUTES } from "@/lib/constants";

export const dynamic = "force-dynamic";

// Every signed-in screen: needs a valid session, and gets the shell with the user's navigation.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(ROUTES.login);
  }
  return <AppShell user={user}>{children}</AppShell>;
}
