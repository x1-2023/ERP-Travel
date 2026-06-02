import { defineConfig, devices } from "@playwright/test"
import path from "path"

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000"
const isCI = !!process.env.CI

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    locale: "vi-VN",
    timezoneId: "Asia/Ho_Chi_Minh",
  },
  projects: [
    {
      name: "setup",
      testMatch: /global-setup\.ts/,
      testDir: ".",
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: path.join(__dirname, ".auth/admin.json"),
      },
      dependencies: ["setup"],
      testIgnore: /auth\/.*/,
    },
    {
      name: "unauthenticated",
      testMatch: /auth\/.*/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: { cookies: [], origins: [] },
      },
    },
  ],
  webServer: isCI
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
})
