import { redirect } from "next/navigation";

import BanksPanel from "@/components/BanksPanel";
import { MENU, ROUTES } from "@/lib/constants";
import { canOpen, getNav } from "@/lib/nav";

export const metadata = { title: "Banks · Karthi Portfolio" };

// A user whose navigation has no Banks goes back to the overview; the BSS only ever returns the caller's own accounts.
export default async function BanksPage() {
  if (!canOpen(await getNav(), MENU.banks)) {
    redirect(ROUTES.overview);
  }
  return <BanksPanel />;
}
