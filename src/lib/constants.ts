// The one place for fixed values: bases, endpoints, routes, messages. Screens and routes import these and never write them out.

// Browser side: the only base is our own origin. Endpoints are appended to it.
export const API_BASE = "/api";
export const ENDPOINTS = {
  auth: { login: "/auth/login", logout: "/auth/logout", me: "/auth/me" },
  health: "/health",
  // Pass-through for module calls: /bff/<module>/<action>.
  bff: "/bff",
} as const;

// Page routes.
export const ROUTES = { login: "/login", overview: "/overview" } as const;

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

export const MESSAGES = {
  notReachable: "The service is not reachable. Please try again.",
  somethingWrong: "Something went wrong. Please try again.",
  signInRequired: "Please sign in.",
  notFound: "Not found",
} as const;
