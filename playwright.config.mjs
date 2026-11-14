import { defineConfig } from "@playwright/test";

// Tests run in Playwright's own fresh Chromium against a local static server for site/.
export default defineConfig({
  testDir: "tests",
  use: { baseURL: "http://localhost:8080", browserName: "chromium" },
  webServer: {
    command: "npx http-server site -p 8080 -s -c-1",
    url: "http://localhost:8080",
    reuseExistingServer: false,
  },
});
