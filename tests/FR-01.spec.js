// FR-01 Đăng ký tài khoản (/register) – data-driven, 12 test cases from HW02.
// Data: data/FR-01.json. "expected" follows the spec (README FR-01), not the current EShop behaviour.
//
// Assertion patterns used in this file:
//   1. URL            – expect(page).toHaveURL(...)
//   2. Visibility     – expect(errorBox).toBeVisible()
//   3. Content        – expect(errorBox).not.toContainText(...)
//   4. Input validity – el.validity.valueMissing (HTML5 required)
//   5. Data state     – users list / login status read through the backend API
//   6. Count          – expect(locator).toHaveCount(n)
const { test, expect } = require('@playwright/test');
const cases = require('../data/FR-01.json');
const {
  SEED, tagRunBy, loginStatus, listUsers, deleteTestUsers, fieldByLabel, openRegister,
} = require('../helpers/common');

const WEAK_PASSWORD_TEXT = 'Mật khẩu quá yếu';

/** Users created by the test run (seed users have id <= SEED.maxUserId). */
async function newUsers(request) {
  return (await listUsers(request)).filter((u) => u.id > SEED.maxUserId);
}

/** Fill the form with one data row and click "Đăng Ký". */
async function submitForm(page, c) {
  await fieldByLabel(page, 'Họ Tên').fill(c.name);
  await fieldByLabel(page, 'Email').fill(c.email);
  await fieldByLabel(page, 'Mật khẩu').fill(c.password);
  // The spec requires a "Xác nhận mật khẩu" field. EShop does not have it (checked by DT-21),
  // so it is filled only when it exists; a missing field must not crash the other cases.
  const confirm = fieldByLabel(page, 'Xác nhận mật khẩu');
  if (await confirm.count()) await confirm.fill(c.confirmPassword);
  await page.getByRole('button', { name: 'Đăng Ký' }).click();
}

test.describe('FR-01 Đăng ký tài khoản', () => {
  test.beforeEach(async ({ page, request }, testInfo) => {
    tagRunBy(testInfo);
    // The database is shared by the three browser runs: start every test with only the seed users.
    await deleteTestUsers(request);
    await openRegister(page);
  });

  test.afterAll(async ({ request }) => {
    await deleteTestUsers(request);
  });

  for (const c of cases) {
    test(`${c.id} – ${c.title}`, async ({ page, request }, testInfo) => {
      testInfo.annotations.push({ type: 'Trace', description: c.trace });
      // Error box = the div right after the form heading; it is rendered only when there is an error.
      // Located by structure, not by the Tailwind class bg-red-100, which is styling and may change.
      const errorBox = page.locator('h2:has-text("Đăng Ký Tài Khoản") + div');

      switch (c.expected) {
        case 'success': {
          await submitForm(page, c);
          // Spec: after a successful registration the user is sent to the Login page.
          await expect(page).toHaveURL(/\/login$/);
          const created = (await listUsers(request)).filter((u) => u.email === c.email);
          expect(created, `user ${c.email} exists in the database`).toHaveLength(1);
          expect(await loginStatus(request, c.email, c.password), 'new account can log in').toBe(200);
          break;
        }

        case 'missing-field': {
          await submitForm(page, c);
          // The browser blocks the submit; the bubble text differs between browsers, so check validity instead.
          const empty = fieldByLabel(page, c.emptyField);
          expect(await empty.evaluate((el) => el.validity.valueMissing), `${c.emptyField} is reported as missing`).toBe(true);
          await expect(page).toHaveURL(/\/register$/);
          expect(await newUsers(request), 'no account created').toHaveLength(0);
          break;
        }

        case 'weak-password': {
          await submitForm(page, c);
          await expect(errorBox).toBeVisible();
          await expect(page).toHaveURL(/\/register$/);
          expect(await newUsers(request), 'no account created').toHaveLength(0);
          break;
        }

        case 'rejected-email': {
          await submitForm(page, c);
          await expect(errorBox).toBeVisible();
          // The password in this row is valid by the spec. A "password too weak" message means the form
          // rejected the row for the wrong reason, so the email rule was never checked.
          // Tester's decision: the spec does not give message wordings. This is a documented negative guard
          // that detects a masked rejection; it does not assert the expected email message.
          await expect(errorBox).not.toContainText(WEAK_PASSWORD_TEXT);
          await expect(page).toHaveURL(/\/register$/);
          expect(await newUsers(request), 'no account created').toHaveLength(0);
          if (c.existingPassword) {
            // Duplicate email: the existing account must be untouched.
            const same = (await listUsers(request)).filter((u) => u.email.toLowerCase() === c.email.toLowerCase());
            expect(same, `only one account uses ${c.email}`).toHaveLength(1);
            expect(await loginStatus(request, c.email, c.existingPassword), 'existing account still logs in').toBe(200);
          }
          break;
        }

        case 'has-confirm-field': {
          // Not fieldByLabel(): it takes .first(), which would hide a duplicated field.
          await expect(page.locator(`label:has-text("${c.confirmLabel}") + input`)).toHaveCount(c.expectedCount);
          break;
        }

        default:
          throw new Error(`Unknown expected value "${c.expected}" in ${c.id}`);
      }
    });
  }
});
