import { NAV, ROLE, type NavItem } from "./constants";
import type { User } from "./types";

// What the navigation shows for this user: an admin sees every item; others see the items whose menu they have (menus null = every menu)
// and none of the admin-only ones. Hiding is for display; the BSS decides what a user may call.
export function visibleNav(user: User): NavItem[] {
  return NAV.filter((item) => {
    if (user.role === ROLE.admin) return true;
    if (item.adminOnly) return false;
    return !item.menu || user.menus === null || user.menus.includes(item.menu);
  });
}
