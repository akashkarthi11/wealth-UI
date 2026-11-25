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
