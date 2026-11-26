import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { ROLE, ROUTES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/currentUser";

// Admin-only screens. A non-admin goes back to the overview; the BSS refuses the data calls in any case.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (user?.role !== ROLE.admin) {
    redirect(ROUTES.overview);
  }
  return children;
}
