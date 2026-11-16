// FR-17 Quản lý Mã Giảm Giá (Admin, tab "Mã Giảm Giá") – data-driven, 16 test cases from HW02.
// Data: data/FR-17.json (15 rows) + 1 standalone test (DT-17, non-admin, no field data).
// "expected" follows the spec (README FR-17), not the current EShop behaviour.
//
// Assertion patterns planned (filled in step 5):
//   1. Data state – coupons read back through GET /api/coupons
//   2. Count      – exactly one table row for a code / no row after delete
//   3. Content    – values in the coupon's table row (money compared as numbers)
//   4. Visibility – DT-17: the "Mã Giảm Giá" tab is not shown to a customer
const { test, expect } = require('@playwright/test');
const cases = require('../data/FR-17.json');
const { tagRunBy, deleteTestCoupons, openAdminTab, ADMIN_URL, USER } = require('../helpers/common');

// ---------- locators (step 2, accepted by the tester) ----------
const couponForm = (page) =>
  page.locator('form', { has: page.getByRole('heading', { name: 'Tạo mã giảm giá mới' }) });
// The discount placeholder changes with the type: "Giá trị % (VD: 10)" / "Số tiền (VD: 50000)".
const discountInput = (form) => form.getByPlaceholder(/^(Giá trị %|Số tiền) \(VD/);
// Row whose first cell is exactly the code (hasText would also match SAVE10 for SAVE1).
const couponRow = (page, code) =>
  page.getByRole('row').filter({ has: page.getByRole('cell', { name: code, exact: true }) });

const isCouponPost = (r) => r.url().endsWith('/api/admin/coupons') && r.request().method() === 'POST';
const isCouponDelete = (r) => /\/api\/admin\/coupons\/\d+$/.test(r.url()) && r.request().method() === 'DELETE';

// ---------- steps ----------

/** Fill "Tạo mã giảm giá mới" with the row's values. "" leaves the field empty (prefilled boxes are cleared). */
async function fillCoupon(page, c) {
  const form = couponForm(page);
  await form.getByPlaceholder('Mã coupon (VD: SAVE10)').fill(String(c.code));
  await form.getByRole('combobox').selectOption(c.type); // before the discount: it changes the placeholder
  await discountInput(form).fill(String(c.discount_value));
  await form.getByPlaceholder('Đơn tối thiểu (₫)').fill(String(c.min_order_amount));
  await form.getByPlaceholder('Ngày hết hạn').fill(String(c.expired_at));
  await form.getByPlaceholder('Số lần dùng tối đa/người').fill(String(c.max_uses_per_user));
}

/**
 * Click "Tạo mã" and wait until the page has reacted: either the browser blocks the submit
 * (a field is :invalid, no request is sent) or the POST to the backend has answered.
 * Returns what happened; the checks decide whether it is right.
 */
async function submitCoupon(page) {
  const form = couponForm(page);
  // Read validity BEFORE the click: after a successful submit the form resets and its empty
  // required fields become :invalid, which would look like a blocked submit.
  const invalidFields = await form.locator(':invalid').count();
  const post = page.waitForResponse(isCouponPost, { timeout: 5_000 }).catch(() => null);
  await form.getByRole('button', { name: 'Tạo mã' }).click();
  if (invalidFields > 0) return { blocked: true, status: null };
  const res = await post;
  if (!res) throw new Error('Tạo mã: no field was invalid and no POST /api/admin/coupons was sent within 5 s');
  return { blocked: false, status: res.status() };
}

/** Click "Xóa" on the row of the code and wait for the DELETE to answer. */
async function deleteCoupon(page, code) {
  const del = page.waitForResponse(isCouponDelete);
  await couponRow(page, code).getByRole('button', { name: 'Xóa' }).click();
  return (await del).status();
}

// ---------- one check per "expected" type (step 5) ----------
const checks = {
  // Spec: Admin có thể Thêm / Xem mã giảm giá; every field rule is met, so the coupon is saved and listed.
  created: async (page, c, ctx) => {},

  // Spec: Các trường bắt buộc … (rule named in c.trace); nothing may be saved.
  rejected: async (page, c, ctx) => {},

  // Spec: Admin có thể … Xóa mã giảm giá.
  deleted: async (page, c, ctx) => {},
};

test.describe('FR-17 Quản lý Mã Giảm Giá', () => {
  test.beforeEach(async ({ page, request }, testInfo) => {
    tagRunBy(testInfo);
    await deleteTestCoupons(request); // start from the 4 seed coupons (id 1–4)
    await openAdminTab(page, 'Mã Giảm Giá');
    await expect(page.getByRole('heading', { name: 'Quản lý Mã Giảm Giá' })).toBeVisible();
  });

  for (const c of cases) {
    test(`${c.id} – ${c.title}`, async ({ page, request }, testInfo) => {
      testInfo.annotations.push({ type: 'Trace', description: c.trace });
      const check = checks[c.expected];
      if (!check) throw new Error(`Unknown expected value "${c.expected}" in ${c.id}`);

      // Every alert is recorded and accepted; registered before any click.
      const ctx = { dialogs: [], submits: [], deletes: [], request };
      page.on('dialog', async (d) => {
        ctx.dialogs.push(d.message());
        await d.accept();
      });

      for (const step of c.steps) {
        if (step === 'create') {
          await fillCoupon(page, c);
          ctx.submits.push(await submitCoupon(page));
        } else if (step === 'delete') {
          ctx.deletes.push(await deleteCoupon(page, c.code));
        } else {
          throw new Error(`Unknown step "${step}" in ${c.id}`);
        }
      }
      testInfo.annotations.push({ type: 'Steps result', description: JSON.stringify({ submits: ctx.submits, deletes: ctx.deletes, dialogs: ctx.dialogs }) });

      await check(page, c, ctx);
    });
  }
});

test.describe('FR-17 Quản lý Mã Giảm Giá – non-admin', () => {
  test.beforeEach(async ({ request }, testInfo) => {
    tagRunBy(testInfo);
    await deleteTestCoupons(request);
  });

  test('TC-FR17-DT-17 – A non-Admin user cannot manage coupons', async ({ page }, testInfo) => {
    testInfo.annotations.push({ type: 'Trace', description: 'FR-17 "Admin có thể Thêm / Xem / Xóa mã giảm giá"' });
    const dialogs = [];
    page.on('dialog', async (d) => {
      dialogs.push(d.message());
      await d.accept();
    });

    await page.goto(ADMIN_URL);
    await page.getByPlaceholder('Email').fill(USER.email);
    await page.getByPlaceholder('Password').fill(USER.password);
    const loginAnswer = page.waitForResponse((r) => r.url().endsWith('/api/login'));
    await page.getByRole('button', { name: 'Login' }).click();
    await loginAnswer;
    // The page has reacted when an alert has fired or the admin layout is shown (whichever happens).
    const adminHeading = page.getByRole('heading', { name: 'EShop Admin' });
    await expect.poll(async () => dialogs.length + (await adminHeading.count()), { message: 'page reacted to the login' }).toBeGreaterThan(0);
    testInfo.annotations.push({ type: 'Steps result', description: JSON.stringify({ dialogs }) });

    // Step 5: assertions (no "Mã Giảm Giá" tab; only the seed coupons exist).
  });
});
