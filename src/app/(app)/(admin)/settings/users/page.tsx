import UsersPanel from "@/components/UsersPanel";
import { getCurrentUser } from "@/lib/currentUser";

export const metadata = { title: "Users · Karthi Portfolio" };

export default async function SettingsUsersPage() {
  const user = await getCurrentUser();
  return <UsersPanel currentUserId={user?.id ?? ""} />;
}
