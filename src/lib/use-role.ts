"use client";

import { useApi } from "@/lib/use-api";
import type { UserRole } from "@/lib/types";

// Defaults to the locked-down read-only view while /api/auth/me is still
// loading, so admin-only controls never flash on screen and then disappear
// for a Viewer. proxy.ts is the real enforcement point — this only drives UI.
export function useRole() {
  const { data, loading } = useApi<{ username: string; role: UserRole }>("/api/auth/me");
  const role: UserRole = data?.role ?? "VIEWER";
  return {
    role: loading ? undefined : role,
    isAdmin: !loading && role === "ADMIN",
    loading,
  };
}
