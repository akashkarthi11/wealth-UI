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
    createRole: `${BFF_PROXY}/admin/roles/create`,
    providersList: `${BFF_PROXY}/admin/connections/list`,
    providersSave: `${BFF_PROXY}/admin/connections/save`,
    providersTest: `${BFF_PROXY}/admin/connections/test`,
    providersRemove: `${BFF_PROXY}/admin/connections/remove`,
    providersFetch: `${BFF_PROXY}/admin/connections/fetch`,
    usersList: `${BFF_PROXY}/admin/users/list`,
    setUserRole: `${BFF_PROXY}/admin/users/set-role`,
  },
  connections: {
    bff: { get: `/connections/bff/get`, update: `/connections/bff/update`, reset: `/connections/bff/reset` },
    bss: { get: `${BFF_PROXY}/admin/connections/bss/get`, update: `${BFF_PROXY}/admin/connections/bss/update`, reset: `${BFF_PROXY}/admin/connections/bss/reset` },
  },
  environment: {
    redis: { get: `${BFF_PROXY}/admin/environment/redis/get`, update: `${BFF_PROXY}/admin/environment/redis/update`, reset: `${BFF_PROXY}/admin/environment/redis/reset` },
    postgres: { get: `${BFF_PROXY}/admin/environment/postgres/get`, update: `${BFF_PROXY}/admin/environment/postgres/update`, reset: `${BFF_PROXY}/admin/environment/postgres/reset` },
    kafka: { get: `${BFF_PROXY}/admin/environment/kafka/get`, update: `${BFF_PROXY}/admin/environment/kafka/update`, reset: `${BFF_PROXY}/admin/environment/kafka/reset` },
  },
  users: { passwordReset: `${BFF_PROXY}/customers/users/password/reset` },
  finvu: {
    config: `${BFF_PROXY}/aa/finvu/config`,
    consentRequest: `${BFF_PROXY}/aa/finvu/consent/request`,
    consentStatus: `${BFF_PROXY}/aa/finvu/consent/status`,
    fiRequest: `${BFF_PROXY}/aa/finvu/fi/request`,
    fiStatus: `${BFF_PROXY}/aa/finvu/fi/status`,
    fiFetch: `${BFF_PROXY}/aa/finvu/fi/fetch`,
  },
  accounts: {
    list: `${BFF_PROXY}/accounts/list`,
    detail: `${BFF_PROXY}/accounts/detail`,
    subtypes: `${BFF_PROXY}/accounts/subtypes`,
    splitsList: `${BFF_PROXY}/accounts/splits/list`,
  },
} as const;

// Page routes.
export const ROUTES = { login: "/login", overview: "/overview", banks: "/banks", settings: "/settings", records: "/records" } as const;

// One account's page: /banks/<id>.
export const bankRoute = (accountId: string) => `${ROUTES.banks}/${accountId}`;

// The menu keys the pages built so far check (the keys are rows of the table wealth_menus; what the menu shows, its order and route come from there).
export const MENU = { overview: "overview", banks: "banks" } as const;

export const ROLE = { admin: "admin", user: "user" } as const;

// Server side only: paths under the BFF base (the address itself is WEALTH_BFF_URL, read once in bff.ts).
export const BFF_API_PREFIX = "/wealth/api/v1/";
export const BFF_PATHS = {
  login: "customers/users/login",
  register: "customers/users/register",
  me: "customers/users/me",
  logout: "customers/users/logout",
  health: "health",
  menus: "menus/list",
  addressSave: "admin/environment/address/save",
  pick: "internal/settings/pick",
} as const;
export const BFF_ACTUATOR_HEALTH = "/actuator/health";
export const BFF_TIMEOUT_MS = 20000;
export const HEALTH_TIMEOUT_MS = 8000;
export const CONNECTION_URL_MAX_LENGTH = 200;

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
