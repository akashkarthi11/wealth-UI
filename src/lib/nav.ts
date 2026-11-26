import { cache } from "react";

import { bffPost } from "./bff";
import { BFF_PATHS } from "./constants";
import { getToken } from "./session";
import type { NavMenu } from "./types";

// The navigation of the signed-in user, as the BSS builds it from the table wealth_menus: only the entries their role may see (the admin sees all),
// each top-level menu with its submenus. Nothing about the menus is written in the UI. Cached per request, so a layout and a page make one call.
export const getNav = cache(async (): Promise<NavMenu[]> => {
  const token = await getToken();
  if (!token) return [];
  const result = await bffPost<NavMenu[]>(BFF_PATHS.menus, undefined, { token });
  return result.body?.status === 1 ? (result.body.data ?? []) : [];
});

// Every key in the navigation, menus and submenus.
const keysOf = (nav: NavMenu[]): string[] => nav.flatMap((menu) => [menu.key, ...keysOf(menu.children)]);

// Whether this key is in the user's navigation (a page checks its own key).
export const canOpen = (nav: NavMenu[], key: string): boolean => keysOf(nav).includes(key);

// Where to send a user who may not open the page they asked for: the first screen their navigation has.
export function firstRoute(nav: NavMenu[]): string | null {
  return nav[0]?.route ?? null;
}
