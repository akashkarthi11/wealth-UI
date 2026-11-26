// The one place for fixed values: bases, endpoints, routes, messages. Screens and routes import these and never write them out.

// Browser side: the only base is our own origin. Endpoints are appended to it.
export const API_BASE = "/api";
// Module calls go through our pass-through route: /bff/<module>/<action>. The token is added on the server.
const BFF_PROXY = "/bff";
export const ENDPOINTS = {
  auth: { login: "/auth/login", logout: "/auth/logout", me: "/auth/me" },
  health: "/health",
  admin: {
    rolesList: `${BFF_PROXY}/admin/roles/list`,
    updateMenus: `${BFF_PROXY}/admin/roles/update-menus`,
    recordsList: `${BFF_PROXY}/admin/records/list`,
  },
  users: { passwordReset: `${BFF_PROXY}/customers/users/password/reset` },
} as const;

// Page routes.
export const ROUTES = { login: "/login", overview: "/overview", settings: "/settings", records: "/records" } as const;

export const ROLE = { admin: "admin", user: "user" } as const;

// The navigation. `menu` is the role-menu key (the user's menus decide whether it shows); adminOnly items show for admins only.
// A module adds its item here when its screen exists.
export interface NavItem {
  label: string;
  route: string;
  menu?: string;
  adminOnly?: boolean;
}
export const NAV: readonly NavItem[] = [
  { label: "Overview", route: ROUTES.overview, menu: "overview" },
  { label: "Records", route: ROUTES.records, adminOnly: true },
  { label: "Settings", route: ROUTES.settings, adminOnly: true },
];

// Server side only: paths under the BFF base (the address itself is WEALTH_BFF_URL, read once in bff.ts).
export const BFF_API_PREFIX = "/wealth/api/v1/";
export const BFF_PATHS = {
  login: "customers/users/login",
  register: "customers/users/register",
  me: "customers/users/me",
  logout: "customers/users/logout",
  health: "health",
} as const;
export const BFF_ACTUATOR_HEALTH = "/actuator/health";
export const BFF_TIMEOUT_MS = 20000;
export const HEALTH_TIMEOUT_MS = 8000;

// Error codes the UI reacts to (BaseError in wealth-common).
export const ERROR_CODE = { invalidRequest: "611", wrongCredentials: "602", tooManyAttempts: "6003" } as const;

// Fixed limits shown to the user (the BSS decides; these only drive the form hints).
export const PASSWORD_MIN_LENGTH = 10;
export const SEARCH_DEBOUNCE_MS = 300;

export const MESSAGES = {
  notReachable: "The service is not reachable. Please try again.",
  somethingWrong: "Something went wrong. Please try again.",
  signInRequired: "Please sign in.",
  notFound: "Not found",
} as const;
