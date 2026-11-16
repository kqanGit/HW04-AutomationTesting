/*
 * FR-01 Đăng ký tài khoản (/register) – data-driven, 12 test cases from HW02.
 * Data: data/FR-01.json. "expected" follows the spec (README FR-01), not the current EShop behaviour.
 * Every case runs in the data loop; this file has no standalone test (DT-21 is the data row whose
 * expected type is "has-confirm-field").
 *
 * Every case first (beforeEach): users with id > 2 are deleted through the API, then /register is opened.
 *
 * ASSERTIONS PER EXPECTED TYPE (in the order they run)
 *
 * success – DT-01
 *   1. [URL]        the page URL ends with /login
 *   2. [Data state] API user list: exactly one user with the row's email
 *   3. [Data state] API login with the row's email and password answers 200
 *   Spec: trace "FR-01 · P1, P4, P12, P21" – "Sau khi đăng ký thành công, người dùng được chuyển tới trang Đăng nhập."
 *   Not asserted: a success message or alert text (the spec gives none) and the content of the Login page
 *   (the URL and the stored account are what the spec sentence promises).
 *
 * missing-field – DT-02 (Họ Tên), DT-04 (Email), DT-17 (Mật khẩu)
 *   1. [Field validity] the input named by emptyField has validity.valueMissing === true
 *   2. [URL]            the URL still ends with /register
 *   3. [Data state]     API user list: no user with id > 2 (no account created)
 *   Spec: "Người dùng phải cung cấp: Họ Tên, Email, Mật khẩu." (trace: "phải cung cấp: Họ Tên" / "Email" / "Mật khẩu")
 *   Not asserted: the browser's validation bubble text – it differs between chromium, firefox and webkit
 *   and is not written in the spec.
 *
 * weak-password – DT-11, DT-12, DT-13, DT-14, DT-15
 *   1. [Visibility] the error box (the div right after the "Đăng Ký Tài Khoản" heading) is visible
 *   2. [URL]        the URL still ends with /register
 *   3. [Data state] API user list: no user with id > 2
 *   Spec: "Yêu cầu mật khẩu mạnh: Tối thiểu 8 ký tự, có ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt"
 *   (trace: "Tối thiểu 8 ký tự" / "ít nhất 1 chữ hoa" / "1 chữ thường" / "1 chữ số" / "1 ký tự đặc biệt")
 *   Not asserted: the error wording and which rule it names – the spec fixes no message text; the data state
 *   check proves the account was refused, and each row breaks exactly one password rule.
 *
 * rejected-email – DT-05 (no @), DT-09 (email already registered)
 *   1. [Visibility]   the error box is visible
 *   2. [Content/text] the error box does NOT contain "Mật khẩu quá yếu" (negative guard: the row's password is
 *                     valid, so a weak-password message means the row was refused for the wrong reason)
 *   3. [URL]          the URL still ends with /register
 *   4. [Data state]   API user list: no user with id > 2
 *   DT-09 only (the row has existingPassword):
 *   5. [Data state]   API user list: exactly one user with that email (case-insensitive)
 *   6. [Data state]   API login with the existing password still answers 200
 *   Spec: "Email phải có định dạng hợp lệ (user@domain.com) và là duy nhất trong hệ thống."
 *   (trace: "định dạng hợp lệ" / "là duy nhất trong hệ thống")
 *   Not asserted: the expected email error wording – the spec gives none (tester's decision). Check 2 only
 *   detects a masked rejection; it does not prove that the email rule produced the message.
 *
 * has-confirm-field – DT-21
 *   1. [Count] exactly expectedCount (1) inputs right after a label "Xác nhận mật khẩu"
 *   Spec: "Phải có trường Xác nhận mật khẩu" (trace: "Phải có trường Xác nhận mật khẩu" · precondition of P21–P23)
 *   Not asserted: the mismatch rule ("hệ thống từ chối nếu hai trường không khớp") – it cannot be exercised
 *   while the field is missing, so no form is submitted in this case. A raw locator is used instead of
 *   fieldByLabel(), which takes .first() and would hide a duplicated field.
 *
 * Distinct assertion patterns in this spec (6): URL, visibility, content/text, count, field validity, data state via API.
 */
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
