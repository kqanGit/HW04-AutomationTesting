// Shared helpers for the HW04 Playwright suite (EShop).
// They only prepare the environment and drive common navigation. Assertions stay in the spec files.
const STUDENT_ID = '23120337';

const WEB = 'http://localhost:5173';
const ADMIN_URL = 'http://localhost:5174';
const API = 'http://localhost:3000';

const ADMIN = { email: 'admin@eshop.com', password: 'Admin123!' };
const USER = { email: 'test@eshop.com', password: 'Test1234!', name: 'Test User' };

// Seed rows created by backend/database.js. Cleanup never touches them.
const SEED = { maxUserId: 2, maxCouponId: 4, maxProductId: 5, maxCategoryId: 3 };

/** Adds "Run by: <StudentID> @ <ISO timestamp>" to the test in the HTML report. Call it from test.beforeEach. */
function tagRunBy(testInfo) {
  testInfo.annotations.push({ type: 'Run by', description: `${STUDENT_ID} @ ${new Date().toISOString()}` });
}

// ---------- API (environment control) ----------

async function apiToken(request, account = ADMIN) {
  const res = await request.post(`${API}/api/login`, { data: { email: account.email, password: account.password } });
  const body = await res.json().catch(() => ({}));
  if (!body.token) throw new Error(`API login failed for ${account.email} (status ${res.status()})`);
  return body.token;
}

async function listUsers(request) {
  const token = await apiToken(request);
  const res = await request.get(`${API}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
  return res.ok() ? res.json() : [];
}

/** FR-01: delete every user that is not a seed user. */
async function deleteTestUsers(request) {
  const token = await apiToken(request);
  const users = await listUsers(request);
  for (const u of users.filter((x) => x.id > SEED.maxUserId)) {
    await request.delete(`${API}/api/admin/users/${u.id}`, { headers: { Authorization: `Bearer ${token}` } });
  }
}

async function listCoupons(request) {
  const token = await apiToken(request);
  const res = await request.get(`${API}/api/coupons`, { headers: { Authorization: `Bearer ${token}` } });
  return res.ok() ? res.json() : [];
}

/** FR-17: delete every coupon that is not one of the 4 seed coupons. */
async function deleteTestCoupons(request) {
  const token = await apiToken(request);
  const coupons = await listCoupons(request);
  for (const c of coupons.filter((x) => x.id > SEED.maxCouponId)) {
    await request.delete(`${API}/api/admin/coupons/${c.id}`, { headers: { Authorization: `Bearer ${token}` } });
  }
}

// ---------- Web (http://localhost:5173) ----------

/** Input that follows a <label> with the given text (EShop labels are not linked to inputs). */
function fieldByLabel(page, label) {
  return page.locator(`label:has-text("${label}") + input`).first();
}

/** Product card on the home page. */
function productCard(page, productName) {
  return page.locator('div.border', { hasText: productName }).first();
}

/** Click "Thêm vào giỏ" on the home page once for each name, in order. The cart lives in memory: never reload after this. */
async function addFromHome(page, productNames) {
  for (const name of productNames) {
    await productCard(page, name).getByRole('button', { name: 'Thêm vào giỏ' }).click();
  }
}

/** Open the cart through the header link (page.goto('/cart') would empty the cart). */
async function openCart(page) {
  await page.getByRole('link', { name: 'Giỏ hàng' }).click();
}

/** Digits only, e.g. "30.000.000 ₫" -> 30000000. Thousand separators differ between browsers. */
function toNumber(text) {
  return Number(String(text).replace(/\D/g, ''));
}

// ---------- Admin (http://localhost:5174) ----------

/** Log in to the Admin app through its UI and open a sidebar tab, e.g. 'Mã Giảm Giá'. */
async function openAdminTab(page, tabName) {
  await page.goto(ADMIN_URL);
  await page.getByPlaceholder('Email').fill(ADMIN.email);
  await page.getByPlaceholder('Password').fill(ADMIN.password);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('heading', { name: 'EShop Admin' }).waitFor();
  await page.locator('li', { hasText: tabName }).first().click();
}

/** Table row that contains the given text (use it to scope the "Xóa" button of one row). */
function rowWith(page, text) {
  return page.locator('tbody tr', { hasText: text });
}

module.exports = {
  STUDENT_ID, WEB, ADMIN_URL, API, ADMIN, USER, SEED,
  tagRunBy, apiToken,
  listUsers, deleteTestUsers, listCoupons, deleteTestCoupons,
  fieldByLabel, productCard, addFromHome, openCart, toNumber,
  openAdminTab, rowWith,
};
