/*
 * FR-07 Giỏ hàng (/cart) – data-driven, 13 test cases (11 from HW02 + AT-01, AT-02 added from the spec).
 * Data: data/FR-07.json. Products, quantities and expected results are those of the HW02 test cases
 * with the same ID (HW2/features/FR-07-shopping-cart/test-cases.md); "expected" follows the spec, not EShop.
 * Every case runs in the data loop (one `checks` function per expected type); there is no standalone test.
 * Most checks are soft (expect.soft / softExpect.poll) so one run reports every mismatch of a case.
 * Money and quantities are compared as numbers (toNumber keeps digits only: separators differ per browser).
 *
 * Every case first:
 *   - beforeEach  [Visibility] the home page heading "Danh sách sản phẩm" is visible
 *   - openCartWith (adds c.add from the home page, opens the cart through the header link)
 *       [URL]        the URL ends with /cart
 *       [Visibility] the first cart row is visible (only when c.add is not empty)
 *   These are preconditions, not the verdict of the case.
 *
 * ASSERTIONS PER EXPECTED TYPE (keys of `checks`, in the order they run)
 *
 * rows-and-totals – DT-02, DT-08, BVA-09, AT-02
 *   1. [Count]        number of tbody rows = rows.length
 *   For each expected row:
 *   2. [Count]        exactly one row contains the product name (skips 3–5 for that product if not)
 *   3. [Content/text] Đơn giá cell (column 2) = unitPrice
 *   4. [Content/text] Số lượng (column 3) = quantity – read as [Input value] when the cell holds an <input>
 *   5. [Content/text] Thành tiền cell (column 4) = lineTotal
 *   Then:
 *   6. [Content/text] grand total (polled) = total, or the sum of the rows' lineTotal when totalFrom = "lineTotals"
 *   Spec: "Hiển thị danh sách sản phẩm với các cột: Sản phẩm, Đơn giá, Số lượng (có nút +/- để chỉnh), Thành tiền,
 *   Thao tác" · "Thêm cùng một sản phẩm vào giỏ sẽ tăng số lượng, không tạo dòng mới" (traces of DT-02, DT-08,
 *   BVA-09, AT-02).
 *   Not asserted: the currency format (₫, separators), the row order, product images. Thành tiền = Đơn giá ×
 *   Số lượng and grand total = sum of Thành tiền are derived from the column names, not quoted in the spec.
 *
 * overview – DT-01
 *   1–6. all assertions of rows-and-totals
 *   7. [Content/text] thead th texts = columns (Sản phẩm, Đơn giá, Số lượng, Thành tiền, Thao tác)
 *   8. [Count]        exactly one "+" button in the row of quantityButtonsFor
 *   9. [Count]        exactly one "−" button (−, - or –) in that row
 *  10. [Visibility]   the label "Tổng cộng" is visible
 *   Spec: "Hiển thị danh sách sản phẩm với các cột: Sản phẩm, Đơn giá, Số lượng (có nút +/- để chỉnh), Thành tiền,
 *   Thao tác" · "Tổng tiền hiển thị nhãn chính xác: "Tổng cộng"".
 *   Not asserted: that the +/- buttons change the quantity (DT-04, DT-05 do that).
 *
 * quantity-button – DT-04 (+ at quantity 1), DT-05 (− at quantity 2)
 *   1. [Count]        exactly one button c.button in the row of c.product (hard: no click without it)
 *   (click)
 *   2. [Content/text] quantity after the click = quantityAfter (input value when the cell is an <input>)
 *   3. [Content/text] Thành tiền after the click = lineTotalAfter
 *   4. [Content/text] grand total after the click (polled) = totalAfter
 *   Spec: "Số lượng (có nút +/- để chỉnh)".
 *   Not asserted: "−" at quantity 1 (no such case in HW02; the spec says nothing about it), button styling.
 *
 * empty-cart – DT-07
 *   1. [Visibility] a text matching /giỏ hàng … trống/i is visible
 *   2. [Count]      no <table> in main
 *   3. [Count]      at least one img or svg in main (toBeGreaterThan(0))
 *   Spec: "Giỏ hàng trống phải có hình minh họa và thông báo rõ ràng".
 *   Not asserted: the exact message wording ("rõ ràng" gives no text) and which picture is shown.
 *
 * remove-dialog – DT-09 (dismiss), DT-10 (accept)
 *   1. [Dialog]       after clicking Xóa a native dialog fired or an element with role="dialog" exists
 *   2. [Content/text] product names of the remaining rows = rowsAfter
 *   3. [Content/text] grand total (polled) = totalAfter
 *   Spec: "Nút Xóa sản phẩm phải có dialog xác nhận trước khi thực hiện".
 *   Not asserted: the dialog message text (the spec gives none) and whether it is confirm() or an in-page modal.
 *
 * remove-to-empty – DT-11
 *   1. [Dialog]     a confirmation was shown after clicking Xóa (answered with accept)
 *   2. [Visibility] empty-cart message is visible
 *   3. [Count]      no <table> in main
 *   4. [Count]      at least one img or svg in main
 *   Spec: "Nút Xóa sản phẩm phải có dialog xác nhận trước khi thực hiện" · "Giỏ hàng trống phải có hình minh họa
 *   và thông báo rõ ràng".
 *   Not asserted: the dialog text and the empty-cart wording (same reasons as remove-dialog and empty-cart).
 *
 * continue-shopping – DT-12
 *   1. [Visibility]   a link or button named "Tiếp tục mua sắm" is visible (hard)
 *   (click)
 *   2. [URL]          the URL is the home page "/"
 *   3. [Visibility]   the heading "Danh sách sản phẩm" is visible
 *   (cart reopened through the header link)
 *   4–9. all assertions of rows-and-totals (the cart is unchanged, HW02 DT-12 step 3)
 *   Spec: "Có nút Tiếp tục mua sắm để quay về trang chủ".
 *   Not asserted: whether the control is an <a> or a <button> (the spec only says "nút").
 *
 * labels – AT-01
 *   1. [Content/text] thead th texts = columns
 *   2. [Visibility]   the label "Tổng cộng" is visible
 *   3. [Count]        no text "Tổng tạm tính" on the page
 *   Spec: columns "Sản phẩm, Đơn giá, Số lượng, Thành tiền, Thao tác" · "Tổng cộng (không phải Tổng tạm tính)".
 *   Not asserted: the grand total value (rows-and-totals cases cover it).
 *
 * Distinct assertion patterns in this spec (5, plus 1 conditional): URL, visibility, content/text, count, dialog;
 * input value only when the Số lượng cell is an <input>. Data state via API is not used: the cart is React state.
 */
const { test, expect } = require('@playwright/test');
const cases = require('../data/FR-07.json');
const { tagRunBy, addFromHome, openCart, toNumber } = require('../helpers/common');

// ---------- locators ----------
const cartRows = (page) => page.locator('tbody tr');
const rowsFor = (page, name) => page.locator('tbody tr', { hasText: name });
// The grand total value is the only <span> in the summary block under the table.
// Located by structure so the value can be read whatever the label says (the label is checked by AT-01).
const totalValue = (page) => page.locator('table + div span').first();
// The spec asks for "a clear message" without fixing the wording: any text saying the cart is empty ("trống").
const emptyMessage = (page) => page.getByText(/giỏ hàng.*trống/i);
const removeButton = (row) => row.getByRole('button', { name: /xóa/i });
const quantityButton = (row, sign) =>
  row.getByRole('button', { name: sign === '+' ? /^\s*\+\s*$/ : /^\s*[-−–]\s*$/ });

const softExpect = expect.configure({ soft: true });

/** Soft check that the number shown in a locator becomes `value` (retries; null while the element is absent). */
async function expectAmount(locator, value, message) {
  await softExpect
    .poll(async () => ((await locator.count()) ? toNumber(await locator.first().innerText()) : null), { message })
    .toBe(value);
}

/** Quantity of a cart row (3rd column), whether it is plain text or an input next to +/- buttons. */
async function quantityOf(row) {
  const cell = row.locator('td').nth(2);
  const input = cell.locator('input');
  if (await input.count()) return Number(await input.first().inputValue());
  return toNumber(await cell.innerText());
}

/** Product names of the cart rows, in order. */
async function rowNames(page) {
  return (await cartRows(page).locator('td:first-child').allInnerTexts()).map((t) => t.trim());
}

/**
 * Build the cart from the home page, then open it through the header link.
 * The cart lives in memory: page.goto('/cart') or a reload would empty it.
 */
async function openCartWith(page, productNames) {
  await addFromHome(page, productNames);
  await openCart(page);
  await expect(page).toHaveURL(/\/cart$/);
  // Precondition: a non-empty cart shows at least one row before any check starts.
  if (productNames.length) await expect(cartRows(page).first()).toBeVisible();
}

/** Record whether a confirmation dialog appears, and answer it. Register before the click. */
function watchDialog(page, action) {
  const seen = { shown: false, message: '' };
  page.on('dialog', async (dialog) => {
    seen.shown = true;
    seen.message = dialog.message();
    if (action === 'accept') await dialog.accept();
    else await dialog.dismiss();
  });
  return seen;
}

/** Click Xóa on the row of `name`, answer any native dialog with `action`; true if a confirmation was shown. */
async function clickRemove(page, name, action) {
  const dialog = watchDialog(page, action);
  await removeButton(rowsFor(page, name).first()).click();
  // A confirmation may also be an in-page modal instead of a native confirm().
  const modalShown = (await page.getByRole('dialog').count()) > 0;
  return dialog.shown || modalShown;
}

/** Spec: an empty cart shows no product table, an illustration and a clear message. */
async function expectEmptyView(page) {
  await expect.soft(emptyMessage(page), 'empty-cart message').toBeVisible();
  await expect.soft(page.locator('main table'), 'no product table').toHaveCount(0);
  const illustrations = await page.locator('main img, main svg').count();
  expect.soft(illustrations, 'illustration (img or svg) in the empty-cart view').toBeGreaterThan(0);
}

// ---------- one check per "expected" type ----------
// Spec: one row per product; same product again raises the quantity; columns Đơn giá, Số lượng, Thành tiền
// (Thành tiền = Đơn giá × Số lượng and the grand total = sum of Thành tiền are derived, not quoted).

/**
 * Expected grand total of a data row: a literal "total", or "totalFrom": "lineTotals" to add up the
 * rows' lineTotal values (so no new money figure has to be written in the data file).
 * Anything else is a data error and fails the test instead of checking nothing.
 */
function expectedTotal(c) {
  if (typeof c.total === 'number') return c.total;
  if (c.totalFrom === 'lineTotals') return c.rows.reduce((sum, r) => sum + r.lineTotal, 0);
  throw new Error(`${c.id}: give "total" (number) or "totalFrom": "lineTotals"`);
}

async function rowsAndTotals(page, c) {
  await expect.soft(cartRows(page), 'number of cart rows').toHaveCount(c.rows.length);
  for (const r of c.rows) {
    const row = rowsFor(page, r.name);
    await expect.soft(row, `exactly one row for "${r.name}"`).toHaveCount(1);
    if ((await row.count()) !== 1) continue; // a duplicated row has no single quantity to read
    const cells = row.locator('td');
    expect.soft(toNumber(await cells.nth(1).innerText()), `unit price of "${r.name}"`).toBe(r.unitPrice);
    expect.soft(await quantityOf(row), `quantity of "${r.name}"`).toBe(r.quantity);
    expect.soft(toNumber(await cells.nth(3).innerText()), `line total of "${r.name}"`).toBe(r.lineTotal);
  }
  await expectAmount(totalValue(page), expectedTotal(c), 'grand total');
}

const checks = {
  'rows-and-totals': rowsAndTotals,

  // HW02 DT-01: rows and totals, plus the column names, the +/- buttons and the label "Tổng cộng".
  overview: async (page, c) => {
    await rowsAndTotals(page, c);
    // Spec: columns Sản phẩm, Đơn giá, Số lượng, Thành tiền, Thao tác.
    await expect.soft(page.locator('thead th'), 'column names').toHaveText(c.columns);
    // Spec: Số lượng (có nút +/- để chỉnh).
    const row = rowsFor(page, c.quantityButtonsFor).first();
    await expect.soft(quantityButton(row, '+'), '"+" button in the Số lượng cell').toHaveCount(1);
    await expect.soft(quantityButton(row, '-'), '"−" button in the Số lượng cell').toHaveCount(1);
    // Spec: Tổng tiền hiển thị nhãn chính xác "Tổng cộng".
    await expect.soft(page.getByText(c.totalLabel), `label "${c.totalLabel}"`).toBeVisible();
  },

  // Spec: the Số lượng column has +/- buttons to change the quantity.
  'quantity-button': async (page, c) => {
    const row = rowsFor(page, c.product).first();
    const button = quantityButton(row, c.button);
    await expect(button, `"${c.button}" button in the row of "${c.product}"`).toHaveCount(1);
    await button.click();
    expect.soft(await quantityOf(row), 'quantity after the click').toBe(c.quantityAfter);
    expect.soft(toNumber(await row.locator('td').nth(3).innerText()), 'line total after the click').toBe(c.lineTotalAfter);
    await expectAmount(totalValue(page), c.totalAfter, 'grand total after the click');
  },

  // Spec: an empty cart must show an illustration and a clear message.
  'empty-cart': async (page) => {
    await expectEmptyView(page);
  },

  // Spec: the Xóa button must show a confirmation dialog before it removes anything.
  'remove-dialog': async (page, c) => {
    const shown = await clickRemove(page, c.remove, c.dialogAction);
    expect.soft(shown, 'a confirmation dialog is shown before removing').toBe(true);
    // The click handler updates the cart synchronously, so the rows can be read right after the click.
    expect.soft(await rowNames(page), `rows after "${c.dialogAction}"`).toEqual(c.rowsAfter);
    await expectAmount(totalValue(page), c.totalAfter, `grand total after "${c.dialogAction}"`);
  },

  // HW02 DT-11: Xóa → dialog appears → confirm → empty-cart view (no table, illustration + clear message).
  'remove-to-empty': async (page, c) => {
    const shown = await clickRemove(page, c.remove, 'accept');
    // Spec: Nút Xóa sản phẩm phải có dialog xác nhận trước khi thực hiện.
    expect.soft(shown, 'a confirmation dialog is shown before removing').toBe(true);
    // Spec: Giỏ hàng trống phải có hình minh họa và thông báo rõ ràng.
    await expectEmptyView(page);
  },

  // Spec: a "Tiếp tục mua sắm" button goes back to the home page; the cart must be kept (HW02 DT-12 step 3).
  'continue-shopping': async (page, c) => {
    const button = page
      .getByRole('link', { name: c.buttonName })
      .or(page.getByRole('button', { name: c.buttonName }));
    await expect(button, `"${c.buttonName}" button on the cart page`).toBeVisible();
    await button.click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Danh sách sản phẩm' }), 'home page product list').toBeVisible();
    await openCart(page);
    await rowsAndTotals(page, c);
  },

  // Spec: exact column names and the label "Tổng cộng" (not "Tổng tạm tính").
  labels: async (page, c) => {
    await expect.soft(page.locator('thead th'), 'column names').toHaveText(c.columns);
    await expect.soft(page.getByText(c.totalLabel), `label "${c.totalLabel}"`).toBeVisible();
    await expect.soft(page.getByText(c.forbiddenTotalLabel), `label "${c.forbiddenTotalLabel}" is not used`).toHaveCount(0);
  },
};

test.describe('FR-07 Giỏ hàng', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    tagRunBy(testInfo);
    // The cart is kept in the page's memory, so every test starts with an empty cart: no API cleanup needed.
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Danh sách sản phẩm' })).toBeVisible();
  });

  for (const c of cases) {
    test(`${c.id} – ${c.title}`, async ({ page }, testInfo) => {
      testInfo.annotations.push({ type: 'Trace', description: c.trace });
      const check = checks[c.expected];
      if (!check) throw new Error(`Unknown expected value "${c.expected}" in ${c.id}`);

      await openCartWith(page, c.add);
      await check(page, c);
    });
  }
});
