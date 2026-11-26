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
