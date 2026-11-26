import { redirect } from "next/navigation";

import OverviewPanel from "@/components/OverviewPanel";
import Panel from "@/components/Panel";
import { MENU, ROUTES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/currentUser";
import { canOpen, firstRoute, getNav } from "@/lib/nav";

export const metadata = { title: "Overview · Karthi Portfolio" };

// The part of the email before the @, as the name to greet.
const nameOf = (email: string) => email.split("@")[0];

// Where a user lands after sign in. Without the Overview menu they go to the first screen their navigation has; with none, they are told why.
export default async function OverviewPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(ROUTES.login);
  }
  const nav = await getNav();
  if (canOpen(nav, MENU.overview)) {
    return <OverviewPanel name={nameOf(user.email)} />;
  }
  const first = firstRoute(nav);
  if (first) {
    redirect(first);
  }
  return <Panel title="No menus yet" hint="No menus are turned on for your account. Ask the owner to turn some on." />;
}
