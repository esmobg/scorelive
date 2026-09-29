import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PLAYWRIGHT_PORT || 43124);
const baseURL = `http://127.0.0.1:${PORT}`;

/** Production `next start` needs a real secret + demo admin for smoke login. */
const E2E_SESSION_SECRET =
  process.env.TURNYFLY_SESSION_SECRET ||
  "playwright-e2e-session-secret-32chars!";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT} --hostname 127.0.0.1`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...process.env,
      TURNYFLY_SESSION_SECRET: E2E_SESSION_SECRET,
      DEMO_ADMIN_ENABLED: "true",
      NEXT_PUBLIC_SITE_URL: "http://127.0.0.1",
    },
  },
});
