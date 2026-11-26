import { redirect } from "next/navigation";

import AccountDetailPanel from "@/components/AccountDetailPanel";
import { MENU, ROUTES } from "@/lib/constants";
import { canOpen, getNav } from "@/lib/nav";

export const metadata = { title: "Account · Karthi Portfolio" };

export default async function AccountPage({ params }: { params: Promise<{ id: string }> }) {
  if (!canOpen(await getNav(), MENU.banks)) {
    redirect(ROUTES.overview);
  }
  const { id } = await params;
  return <AccountDetailPanel accountId={id} />;
}
