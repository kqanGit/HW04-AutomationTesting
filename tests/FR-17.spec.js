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
const {
  tagRunBy, deleteTestCoupons, openAdminTab, listCoupons, toNumber, SEED, ADMIN_URL, USER,
} = require('../helpers/common');

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
// Table cells of a coupon row: 0 Mã · 1 Loại · 2 Giá trị · 3 Đơn tối thiểu · 4 Hết hạn · 5 Giới hạn/người · 6 Hành động.
// Only numbers are compared on screen (digits only: thousands separators differ per browser);
// the spec does not define how type and date are displayed, so those are checked in the saved data.
const checks = {
  // Spec: "Admin có thể Thêm / Xem … mã giảm giá"; every rule of "Các trường bắt buộc" is met.
  created: async (page, c, ctx) => {
    const all = await listCoupons(ctx.request);
    const saved = all.filter((x) => x.code === c.code);
    // Spec: Thêm + "`code` (duy nhất)" – the coupon is saved exactly once.
    expect(saved, `coupons saved with code "${c.code}"`).toHaveLength(1);
    // Spec: Thêm – the 4 seed coupons are untouched, only one coupon is added.
    expect.soft(all, 'number of coupons (4 seed + 1)').toHaveLength(SEED.maxCouponId + 1);
    // Spec: Các trường bắt buộc – every field is stored with the value entered.
    const s = saved[0];
    expect.soft(s.type, 'saved type').toBe(c.type);
    expect.soft(Number(s.discount_value), 'saved discount_value').toBe(c.discount_value);
    expect.soft(Number(s.min_order_amount), 'saved min_order_amount').toBe(c.min_order_amount);
    expect.soft(String(s.expired_at).slice(0, 10), 'saved expired_at').toBe(c.expired_at);
    expect.soft(Number(s.max_uses_per_user), 'saved max_uses_per_user').toBe(c.max_uses_per_user);

    // Spec: Xem – the new coupon appears once in the list.
    const row = couponRow(page, c.code);
    await expect(row, `table rows for "${c.code}"`).toHaveCount(1);
    const cells = row.locator('td');
    // Spec: Xem – the listed values are the entered values.
    expect.soft(toNumber(await cells.nth(2).innerText()), 'Giá trị shown').toBe(c.discount_value);
    expect.soft(toNumber(await cells.nth(3).innerText()), 'Đơn tối thiểu shown').toBe(c.min_order_amount);
    expect.soft(toNumber(await cells.nth(5).innerText()), 'Giới hạn/người shown').toBe(c.max_uses_per_user);
  },

  // Spec: "Các trường bắt buộc: …" (the broken rule is named in c.trace) – an invalid coupon is not saved.
  // submitCoupon has already waited for the page to react (browser block or backend answer),
  // so the saved data is final when it is read here.
  rejected: async (page, c, ctx) => {
    const all = await listCoupons(ctx.request);
    const added = all.filter((x) => x.id > SEED.maxCouponId).map((x) => x.code); // the diff quotes them, so "   " stays visible
    // Spec: Các trường bắt buộc – nothing besides the 4 seed coupons exists (also catches a 2nd SAVE10).
    expect(added, 'coupons saved besides the 4 seed coupons').toEqual([]);
  },

  // Spec: "Admin có thể … Xóa mã giảm giá".
  deleted: async (page, c, ctx) => {
    const all = await listCoupons(ctx.request);
    // Spec: Xóa – the coupon is no longer saved.
    expect(all.filter((x) => x.code === c.code), `coupons saved with code "${c.code}"`).toHaveLength(0);
    // Spec: Xóa removes only that coupon – the 4 seed coupons are untouched.
    expect.soft(all, 'number of coupons (4 seed)').toHaveLength(SEED.maxCouponId);
    // Spec: Xem – the deleted coupon is no longer listed.
    await expect(couponRow(page, c.code), `table rows for "${c.code}"`).toHaveCount(0);
  },
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

    // Spec: only "Admin có thể Thêm / Xem / Xóa mã giảm giá" – a customer reaches neither the tab nor the coupon page.
    // (The alert wording is not in the spec and is not asserted.)
    await expect(page.locator('li', { hasText: 'Mã Giảm Giá' }), '"Mã Giảm Giá" tab for a customer').toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Quản lý Mã Giảm Giá' }), 'coupon page for a customer').toHaveCount(0);
  });
});
