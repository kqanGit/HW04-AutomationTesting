// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const STUDENT_ID = '23120337';
// FEATURE / BROWSER are set by run-all.js so that every run writes its own report folder.
const FEATURE = process.env.FEATURE || 'all';
const BROWSER = process.env.BROWSER || 'all';
const STAMP = new Date().toISOString();

module.exports = defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  workers: 1,            // every test shares one backend and one database
  fullyParallel: false,
  retries: 0,            // no retries: a retry could hide a real defect
  timeout: 30_000,
  expect: { timeout: 5_000 },
  metadata: { 'Run by': STUDENT_ID, 'Started at': STAMP, Feature: FEATURE, Browser: BROWSER },
  reporter: [
    ['list'],
    ['html', {
      open: 'never',
      outputFolder: `reports/${FEATURE}-${BROWSER}`,
      title: `Run by: ${STUDENT_ID} | ${FEATURE} | ${BROWSER} | ${STAMP}`,
    }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    locale: 'vi-VN',
    viewport: { width: 1280, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
