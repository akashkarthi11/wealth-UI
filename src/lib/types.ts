export interface ApiResponse<T> {
  data: T | null;
  status: number;
  errorCode: string | null;
  errorMessage: string | null;
}

export interface User {
  id: string;
  email: string;
  role: "admin" | "user";
  // null means every menu
  menus: string[] | null;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  user: User;
}

// Result of our /api/health route: the BFF health API (bff, bss, db, redis) as seen from the server.
export interface HealthReport {
  configured: boolean;
  reachable: boolean;
  status: string | null;
  bss: string | null;
  db: string | null;
  redis: string | null;
}

// Admin module (BFF admin/…, DTOs in wealth-common).
export interface MenuItem {
  key: string;
  label: string;
  group: string;
  // The menu this entry is a submenu of (null for a top-level menu), and whether its page exists yet.
  parentKey: string | null;
  active: boolean;
  // Only the admin has it: shown, but a role cannot be given it.
  adminOnly: boolean;
}

export interface RoleInfo {
  role: string;
  label: string;
  users: number;
  locked: boolean;
  menus: string[];
}

export interface RolesOverview {
  menus: MenuItem[];
  roles: RoleInfo[];
}

export interface RoleMenusSaved {
  role: string;
  menus: string[];
}

export interface RecordItem {
  id: string;
  sourceKey: string;
  sourceName: string;
  // YYYY-MM-DD
  snapshotDate: string;
  // JSON text
  payload: string;
  createdAt: string | null;
}

// Accounts module (BFF accounts/…, DTOs in wealth-common). Money is a number in the account's currency.
export type BalanceStatus = "verified" | "reported" | "estimated" | "stale" | "unknown" | "pending_reconciliation";

export interface Account {
  id: string;
  accountKey: string;
  bankName: string;
  accountName: string;
  subtypeCode: string;
  // CASA, INVESTMENT or LIABILITY
  category: string | null;
  maskedIdentifier: string | null;
  currency: string;
  status: string;
  balance: number | null;
  balanceAsOf: string | null;
  balanceStatus: BalanceStatus | null;
  fdPrincipal: number | null;
  fdBookedOn: string | null;
  fdMaturityOn: string | null;
  fdPayout: string | null;
  fdCompounding: string | null;
}

export interface AccountTotals {
  casa: number;
  investment: number;
  liability: number;
  netWorth: number;
}

export interface Bank {
  name: string;
  totals: AccountTotals;
  accounts: Account[];
}

export interface AccountsOverview {
  totals: AccountTotals;
  banks: Bank[];
}

export interface AccountBalance {
  asOf: string;
  balance: number;
  status: BalanceStatus;
  note: string | null;
  enteredBy: string | null;
}

export interface SplitMove {
  occurredAt: string;
  amount: number;
  transactionId: string | null;
  note: string | null;
}

export interface AccountSplit {
  id: string;
  splitKey: string;
  name: string;
  kind: string | null;
  goalAmount: number | null;
  purpose: string | null;
  estimatedBalance: number | null;
  balanceStatus: BalanceStatus | null;
  balanceAsOf: string | null;
  moves: SplitMove[];
}

export interface AccountDetail {
  account: Account;
  balances: AccountBalance[];
  splits: AccountSplit[];
}

// Settings > Environment: one address (BFF admin/connections and admin/environment, and our own /api/connections/bff/… for the UI to BFF address).
export interface ConnectionInfo {
  url: string;
  defaultUrl: string;
  customised: boolean;
  status: "UP" | "DOWN" | "NOT_CONFIGURED";
  // Only for the data services (Redis, Kafka, Postgres): the user it signs in as, and whether a password is set. The password is never returned.
  username?: string;
  passwordSet?: boolean;
}

// The navigation (BFF menus/list, built from the table wealth_menus): the entries the signed-in user may see.
export interface NavMenu {
  key: string;
  label: string;
  route: string;
  group: string;
  children: NavMenu[];
}

// A user and their role, for the admin's Users screen (BFF admin/users/list).
export interface UserAccess {
  id: string;
  email: string;
  role: string;
}

// A third-party service (BFF admin/connections/…). The key itself is never returned: only whether one is set and its last characters.
export interface Provider {
  provider: string;
  label: string;
  baseUrl: string;
  enabled: boolean;
  priority: number;
  keySet: boolean;
  keyHint: string | null;
  // The result of the last Test connection; null when never tested or changed since.
  status: "ok" | "failed" | null;
  checkedAt: string | null;
  // Angel One: the names of the login values that are saved (never the values), the daily fetch switch and the last fetch.
  extraSet: string[] | null;
  autoFetch: boolean;
  lastFetchAt: string | null;
  lastFetchNote: string | null;
}
