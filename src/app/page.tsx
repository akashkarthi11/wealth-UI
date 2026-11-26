import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";

// The home address is the sign-in page.
export default function Home() {
  redirect(ROUTES.login);
}
