import { cache } from "react";

import { bffPost } from "./bff";
import { BFF_PATHS } from "./constants";
import { getToken } from "./session";
import type { User } from "./types";

// The signed-in user for this request, or null. Cached per request, so a layout and a page asking for it make one BFF call.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await getToken();
  if (!token) return null;
  const result = await bffPost<User>(BFF_PATHS.me, undefined, { token });
  return result.body?.status === 1 ? result.body.data : null;
});
