import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";
import { getNav } from "@/lib/nav";

// Settings opens on its first submenu, as the table lists them.
export default async function SettingsPage() {
  const settings = (await getNav()).find((menu) => menu.route === ROUTES.settings);
  redirect(settings?.children[0]?.route ?? ROUTES.overview);
}
