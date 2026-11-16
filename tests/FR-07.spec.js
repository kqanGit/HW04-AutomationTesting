// FR-07 Giỏ hàng (/cart) – data-driven, 12 test cases (11 from HW02 + AT-01 added from the spec).
// Data: data/FR-07.json. "expected" follows the spec (README FR-07), not the current EShop behaviour.
//
// Assertion patterns used in this file:
//   1. Count        – expect(rows).toHaveCount(n)
//   2. Content      – expect(headers).toHaveText([...]), numeric cell values
//   3. Visibility   – expect(locator).toBeVisible()
//   4. URL          – expect(page).toHaveURL(...)
//   5. Dialog       – a confirmation dialog was shown before removing a product
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

// ---------- one check per "expected" type ----------
const checks = {
  // Spec: one row per product; same product again raises the quantity; Thành tiền = Đơn giá × Số lượng.
  'rows-and-totals': async (page, c) => {
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
    expect.soft(toNumber(await totalValue(page).innerText()), 'grand total').toBe(c.total);
  },

  // Spec: the Số lượng column has +/- buttons to change the quantity.
  'quantity-button': async (page, c) => {
    const row = rowsFor(page, c.product).first();
    const name = c.button === '+' ? /^\s*\+\s*$/ : /^\s*[-−–]\s*$/;
    const button = row.getByRole('button', { name });
    await expect(button, `"${c.button}" button in the row of "${c.product}"`).toHaveCount(1);
    await button.click();
    expect.soft(await quantityOf(row), 'quantity after the click').toBe(c.quantityAfter);
    expect.soft(toNumber(await row.locator('td').nth(3).innerText()), 'line total after the click').toBe(c.lineTotalAfter);
  },

  // Spec: an empty cart must show an illustration and a clear message.
  'empty-cart': async (page) => {
    await expect.soft(emptyMessage(page), 'empty-cart message').toBeVisible();
    await expect.soft(cartRows(page), 'no product rows').toHaveCount(0);
    const illustrations = await page.locator('main img, main svg').count();
    expect.soft(illustrations, 'illustration (img or svg) in the empty-cart view').toBeGreaterThan(0);
  },

  // Spec: the Xóa button must show a confirmation dialog before it removes anything.
  'remove-dialog': async (page, c) => {
    const dialog = watchDialog(page, c.dialogAction);
    await removeButton(rowsFor(page, c.remove).first()).click();
    // A confirmation may also be an in-page modal instead of a native confirm().
    const modalShown = (await page.getByRole('dialog').count()) > 0;
    expect.soft(dialog.shown || modalShown, 'a confirmation dialog is shown before removing').toBe(true);
    // The click handler updates the cart synchronously, so the rows can be read right after the click.
    expect.soft(await rowNames(page), `rows after "${c.dialogAction}"`).toEqual(c.rowsAfter);
  },

  // Spec: after the last product is removed the cart is empty and says so.
  'remove-to-empty': async (page, c) => {
    watchDialog(page, 'accept'); // the dialog itself is verified by DT-09 and DT-10
    await removeButton(rowsFor(page, c.remove).first()).click();
    await expect(cartRows(page), 'no product rows left').toHaveCount(0);
    await expect(emptyMessage(page), 'empty-cart message').toBeVisible();
  },

  // Spec: a "Tiếp tục mua sắm" button goes back to the home page; the cart must be kept.
  'continue-shopping': async (page, c) => {
    const button = page
      .getByRole('link', { name: c.buttonName })
      .or(page.getByRole('button', { name: c.buttonName }));
    await expect(button, `"${c.buttonName}" button on the cart page`).toBeVisible();
    await button.click();
    await expect(page).toHaveURL('/');
    await openCart(page);
    expect(await rowNames(page), 'cart rows after coming back').toEqual(c.rowsAfter);
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
