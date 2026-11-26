import Panel from "@/components/Panel";
import { getCurrentUser } from "@/lib/currentUser";

// Placeholder landing page: proves the session works. The real Overview is the dashboard module.
export default async function OverviewPage() {
  const user = await getCurrentUser();
  return <Panel title="Signed in" hint={`${user?.email} · ${user?.role}. The dashboard arrives with the accounts module.`} />;
}
