import { isProductionRuntime } from "@/lib/auth/crypto-seal";

/** Built-in demo admin is off in production unless explicitly re-enabled. */
export function isDemoAdminEnabled(): boolean {
  if (process.env.DEMO_ADMIN_ENABLED === "true") {
    return true;
  }
  if (process.env.DEMO_ADMIN_ENABLED === "false") {
    return false;
  }
  return !isProductionRuntime();
}
