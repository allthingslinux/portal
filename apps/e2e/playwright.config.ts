import { defineConfig, devices } from '@playwright/test';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();
dotenvConfig({ path: '.env.local' });

/**
 * Number of workers to use in CI. Tweak based on your CI provider's resources.
 */
const CI_WORKERS = 2;


if (!enableTeamAccountTests) {
  console.log(
    `Team account tests are disabled. To enable them, set the environment variable ENABLE_TEAM_ACCOUNT_TESTS=true.`,
    `Current value: "${process.env.ENABLE_TEAM_ACCOUNT_TESTS}"`,
  );

  testIgnore.push('*team-accounts.spec.ts');
  testIgnore.push('*invitations.spec.ts');
}

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  retries: 2,
  /* Limit parallel tests on CI. */
  workers: process.env.CI ? CI_WORKERS : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  testIgnore,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    // take a screenshot when a test fails
    screenshot: 'only-on-failure',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    navigationTimeout: 15 * 1000,
    testIdAttribute: 'data-test',
  },
  // test timeout set to 2 minutes
  timeout: 120 * 1000,
  expect: {
    // expect timeout set to 10 seconds
    timeout: 10 * 1000,
  },
  /* Configure projects for major browsers */
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.PLAYWRIGHT_SERVER_COMMAND
    ? {
        cwd: '../../',
        command: process.env.PLAYWRIGHT_SERVER_COMMAND,
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        stdout: 'pipe',
        stderr: 'pipe',
      }
    : undefined,
});
