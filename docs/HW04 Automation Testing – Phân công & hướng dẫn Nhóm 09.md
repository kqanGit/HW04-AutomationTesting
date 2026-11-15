# HW04 Automation Testing – Phân công & hướng dẫn Nhóm 09

Nov 15, 2026 · @KKVibeCoder

## 1. Phân công

Mỗi người tự động hóa đúng 3 feature web đã làm ở HW02; đề không cho đổi feature. Phần "chọn dễ nhất" vì vậy áp dụng cho việc chọn 12 test case trong mỗi feature, không phải chọn feature.

| Thành viên | Pool A | Pool B | Pool C | Độ khó chung |
| --- | --- | --- | --- | --- |
| Quân (23120337) | FR-01 Đăng ký | FR-07 Giỏ hàng | FR-17 CRUD coupon | Dễ: form đơn giản, không cần đăng nhập ở web |
| Quang | FR-04 Hồ sơ | FR-09 Mã giảm giá | FR-14 CRUD danh mục | Trung bình: FR-09 cần đăng nhập + dựng giỏ hàng trước |
| Phúc | FR-06 Chi tiết sản phẩm | FR-08 Checkout | FR-15 CRUD sản phẩm | Trung bình: FR-08 cần đăng nhập + dựng giỏ hàng trước |

HW04 là bài cá nhân. Mỗi người có repo riêng, report riêng, video riêng và tự viết prompt của mình. Pool D (mobile) không dùng trong bài này.

Mốc việc đề xuất cho mỗi người (đề ước lượng 10 giờ):

1. Setup repo + config + chạy được 1 test mẫu trên 3 browser (1 giờ).
2. Feature A: data file, script, review, sửa (2 giờ).
3. Feature B (2 giờ).
4. Feature C (2 giờ).
5. Chạy 9 lượt, lưu 9 HTML report, log bug lên GitHub Issues (1 giờ).
6. Report, AI Audit, AI Critique, README, commit log, quay video (2 giờ).

## 2. Quy định của đề cần nhớ

Thiếu bất kỳ tài liệu bắt buộc nào là 0 điểm, và chép prompt của nhau là 0 điểm cho cả hai. Tài liệu này chỉ mô tả cách làm; không ai dán nguyên văn prompt của người khác.

| Yêu cầu | Con số tối thiểu |
| --- | --- |
| Test case tự động hóa | 12 cho mỗi feature, tổng 36 |
| Dữ liệu test | File `.json` hoặc `.csv` riêng; mảng viết thẳng trong script không được tính |
| Kiểu assertion | 3 kiểu khác nhau trở lên |
| Browser | 3 browser cho mỗi feature, tổng 9 lượt chạy |
| HTML report | Mỗi lượt chạy một report, có chữ "Run by: {MSSV}" và timestamp ISO |
| Commit | 8 commit có sửa file `.spec.js`; commit chỉ sửa README hay PDF không tính |
| Video | YouTube unlisted, từ 5 phút, thuyết minh tiếng Việt, có face-cam hoặc terminal chạy `whoami` và `hostname` |
| AI Critique | 200–300 từ |
| Tên file nộp | `<MSSV>_HW04_AI_Automation_<điểm 3 chữ số>.zip` |

Thang điểm: mỗi feature 25, video 15, Agent Skill 10.

Report HTML và video phải là kết quả chạy thật trên máy của chính mình. TA kiểm tra hai thứ này, nên không nhờ người khác chạy hộ và không sửa tay file report.

## 3. Setup chung (ai cũng làm giống nhau)

Dùng Playwright với JavaScript và HTML reporter có sẵn, vì cả nhóm đã quen từ HW02 và không phải cài thêm Allure.

### 3.1 Chạy EShop

1. `cd eshop-sut` rồi `git pull` để chắc là đang ở bản mới nhất.
2. Terminal 1: `cd backend` → `npm install` → `node server.js` (cổng 3000).
3. Terminal 2: `cd frontend-web` → `npm install` → `npm run dev` (cổng 5173).
4. Terminal 3: `cd frontend-admin` → `npm install` → `npm run dev` (cổng 5174).

Tài khoản: admin `admin@eshop.com` / `Admin123!`, user `test@eshop.com` / `Test1234!`. Mỗi lần khởi động lại backend, database về lại seed: 2 user, 5 sản phẩm, 3 danh mục, 4 coupon.

### 3.2 Tạo repo

1. Tạo repo public trên GitHub, ví dụ `HW04-Automation`, rồi clone về.
2. `npm init -y` → `npm i -D @playwright/test` → `npx playwright install chromium firefox webkit`.
3. Tạo cấu trúc:

```text
HW04-Automation/
  tests/        FR-xx.spec.js (3 file, mỗi feature 1 file)
  data/         FR-xx.json    (3 file dữ liệu)
  helpers/      common.js     (login, dọn dữ liệu)
  reports/      9 thư mục HTML report (commit lên repo)
  report/       main-report.md, bugs.md, ảnh GitHub Issues
  ai/           audit-report.md, critique.md
  skills/       Agent Skill
  playwright.config.js, run-all.js, README.md, git-commit-log.txt
```

`.gitignore` chỉ ghi `node_modules/` và `test-results/`. Không ignore `reports/` vì đề yêu cầu repo chứa HTML report.

### 3.3 playwright.config.js

```js
const { defineConfig, devices } = require('@playwright/test');

const STUDENT_ID = '2312xxxx';               // MSSV của chính bạn
const FEATURE = process.env.FEATURE || 'all';
const BROWSER = process.env.BROWSER || 'all';
const STAMP = new Date().toISOString();

module.exports = defineConfig({
  testDir: './tests',
  workers: 1,            // các test dùng chung 1 backend
  fullyParallel: false,
  retries: 0,            // không retry để không che bug
  timeout: 30_000,
  metadata: { 'Run by': STUDENT_ID, 'Started at': STAMP },
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
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});
```

Sau lần chạy đầu, mở report và kiểm tra dòng "Run by: …" có hiện ở đầu trang không. Tùy chọn `title` cần Playwright bản mới (HW02 dùng 1.64.1). Để chắc chắn, thêm annotation vào mỗi file spec; nó hiện trong từng test của report:

```js
test.beforeEach(async ({}, testInfo) => {
  testInfo.annotations.push({
    type: 'Run by',
    description: `2312xxxx @ ${new Date().toISOString()}`,
  });
});
```

### 3.4 run-all.js – chạy 9 lượt, ra 9 report

```js
const { spawnSync } = require('child_process');
const features = ['FR-01', 'FR-07', 'FR-17'];        // đổi thành 3 FR của bạn
const browsers = ['chromium', 'firefox', 'webkit'];

for (const f of features) {
  for (const b of browsers) {
    spawnSync('npx', ['playwright', 'test', `tests/${f}.spec.js`, `--project=${b}`], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, FEATURE: f, BROWSER: b },
    });
  }
}
```

Chạy `node run-all.js`. Kết quả là 9 thư mục `reports/FR-01-chromium`, `reports/FR-01-firefox`, … mỗi thư mục có `index.html`. Xem một report: `npx playwright show-report reports/FR-01-chromium`.

### 3.5 Khung file spec data-driven

```js
const { test, expect } = require('@playwright/test');
const cases = require('../data/FR-01.json');   // dữ liệu nằm ở file riêng

for (const c of cases) {
  test(`${c.id} – ${c.title}`, async ({ page }) => {
    // 1. arrange  2. act theo c.input  3. assert theo c.expected
  });
}
```

Mỗi dòng trong file JSON có: `id`, `title`, các giá trị nhập, và `expected` (kết quả theo đặc tả, không theo hành vi hiện tại của app).

### 3.6 Các kiểu assertion nên dùng

Chọn ít nhất 3 kiểu trong mỗi bài và liệt kê chúng trong report.

| Kiểu | Ví dụ | Dùng khi |
| --- | --- | --- |
| URL | `await expect(page).toHaveURL(/\/login$/)` | Kiểm tra chuyển trang |
| Hiển thị | `await expect(locator).toBeVisible()` | Thông báo lỗi, nút, nhãn |
| Nội dung | `await expect(locator).toHaveText('...')` | Tổng tiền, tên sản phẩm |
| Số lượng | `await expect(rows).toHaveCount(2)` | Số dòng trong bảng |
| Giá trị ô nhập | `await expect(input).toHaveValue('1')` | Form sau khi lưu |
| Thuộc tính | `await expect(input).toHaveAttribute('type', 'email')` | Yêu cầu về `type`, `alt`, `disabled` |
| Dialog | `expect(dialog.message()).toContain('...')` | `alert` của app |
| Trạng thái dữ liệu | `expect(list.some(x => x.code === 'ABC')).toBe(true)` sau khi gọi API | Xác nhận bản ghi đã lưu hay chưa |

## 4. Các bẫy của EShop khi viết script

Những điểm dưới đây lấy từ mã nguồn EShop; AI thường sinh script sai đúng ở các chỗ này, nên đây cũng là nguồn cho phần "AI sai gì, vì sao" trong report.

| Bẫy | Nguyên nhân trong code | Cách xử lý |
| --- | --- | --- |
| Giỏ hàng mất khi `page.goto` hoặc reload | Giỏ chỉ nằm trong React state, không lưu localStorage | Chỉ `goto('/')` một lần đầu test; sau đó di chuyển bằng cách bấm link "Giỏ hàng", logo "EShop" |
| Cần đăng nhập rồi mới có giỏ | Như trên | Đăng nhập qua UI trước, rồi mới thêm sản phẩm |
| Trang đăng nhập web có nhãn lạ | Tiêu đề "Đăng Ký", nhãn "Username", nút "Sign In" | Locator theo đúng chữ đang hiển thị, không theo đặc tả |
| Ô nhập không có `id`, `name`, `label for` | Form viết tối giản | Web: `label:has-text("Họ Tên") + input`. Admin: `getByPlaceholder('Tên danh mục mới')` |
| Nhiều nút "Xóa", "Sửa" trùng tên | Mỗi dòng bảng một nút | Khoanh theo dòng: `page.locator('tr', { hasText: 'ABC' }).getByRole('button', { name: 'Xóa' })` |
| Thông báo bằng `alert()` | Profile, Cart, Checkout, Admin dùng `alert` | Đăng ký `page.on('dialog', ...)` trước khi bấm nút, lưu `dialog.message()` rồi `accept()` |
| Ô `required` bỏ trống không hiện lỗi trong trang | Trình duyệt chặn submit bằng bong bóng HTML5 | Assert `input.evaluate(el => el.validity.valueMissing)` là `true` và URL không đổi; không assert nội dung bong bóng vì mỗi browser một kiểu |
| Ô `type="number"` không nhận chữ | Playwright báo lỗi khi `fill('abc')` | Test case "không phải số" ghi vào mục không tự động hóa được, kèm lý do |
| Ô `type="date"` | Nhận định dạng ISO | `fill('2099-12-31')` |
| Số tiền hiển thị khác nhau giữa browser | `toLocaleString()` phụ thuộc locale | Đặt `locale: 'vi-VN'` trong config và so sánh sau khi bỏ hết ký tự không phải số: `text.replace(/\D/g, '')` |
| Chạy browser thứ hai thì fail vì dữ liệu cũ | Database không reset giữa các lượt; mã coupon là UNIQUE | Dọn dữ liệu test bằng API trong `beforeEach` (xem dưới) |
| Nút "Thêm vào giỏ hàng" ở trang chi tiết | Lần bấm đầu không làm gì, lần hai mới thêm | Không bấm hai lần để "lách"; để test fail và báo bug |
| Admin ở cổng khác | 5174, token lưu ở `adminToken` | Dùng URL đầy đủ `http://localhost:5174`; đăng nhập qua `getByPlaceholder('Email')` và `getByPlaceholder('Password')` |

API dùng để dọn dữ liệu (backend `http://localhost:3000`):

| Việc | API |
| --- | --- |
| Lấy token admin | `POST /api/login` với `{ email, password }` → `token` |
| Xóa user test | `GET /api/admin/users`, `DELETE /api/admin/users/:id` |
| Xóa danh mục test | `GET /api/categories`, `DELETE /api/categories/:id` |
| Xóa sản phẩm test | `GET /api/products`, `DELETE /api/products/:id` |
| Xóa coupon test | `GET /api/coupons`, `DELETE /api/admin/coupons/:id` |

Các API cần token gửi header `Authorization: Bearer <token>`. Chỉ xóa bản ghi không thuộc seed (user id > 2, danh mục id > 3, sản phẩm id > 5, coupon id > 4). Lượt dùng coupon không có API xóa; test nào tiêu lượt dùng thì phải khởi động lại backend trước lượt chạy tiếp theo.

Nguyên tắc về test fail: `expected` viết theo đặc tả. EShop cài sẵn nhiều lỗi, nên test đỏ do lỗi thật là kết quả đúng và là bằng chứng cho bug report. Không sửa assertion cho test xanh.

## 5. Quân – FR-01, FR-07, FR-17

Mỗi feature dưới đây có 12 test case dễ tự động hóa nhất, lấy từ `test-cases.md` của HW02. Cột "Dự đoán" suy ra từ mã nguồn; kết quả thật phải lấy từ lần chạy.

### 5.1 FR-01 Đăng ký (`/register`)

Locator: `label:has-text("Họ Tên") + input`, tương tự cho "Email" và "Mật khẩu"; nút `getByRole('button', { name: 'Đăng Ký' })`; ô lỗi `.bg-red-100`.

| ID | Nội dung | Expected theo đặc tả | Dự đoán |
| --- | --- | --- | --- |
| DT-01 | Tất cả hợp lệ | Chuyển sang `/login`, user có trong danh sách | Fail (bug mật khẩu hợp lệ bị từ chối) |
| DT-02 | Họ Tên rỗng | Ở lại `/register`, ô báo thiếu | Pass |
| DT-04 | Email rỗng | Ở lại `/register`, ô báo thiếu | Pass |
| DT-05 | Email không có `@` | Ở lại, không tạo user | Pass nhưng sai lý do |
| DT-09 | Email đã tồn tại | Ở lại, số user không tăng | Pass nhưng sai lý do |
| DT-11 | Mật khẩu 7 ký tự | Hiện lỗi mật khẩu yếu | Pass |
| DT-12 | Thiếu chữ hoa | Hiện lỗi mật khẩu yếu | Pass |
| DT-13 | Thiếu chữ thường | Hiện lỗi mật khẩu yếu | Pass |
| DT-14 | Thiếu chữ số | Hiện lỗi mật khẩu yếu | Pass |
| DT-15 | Thiếu ký tự đặc biệt | Hiện lỗi mật khẩu yếu | Pass |
| DT-17 | Mật khẩu rỗng | Ở lại, ô báo thiếu | Pass |
| DT-21 | Form có ô "Xác nhận mật khẩu" | Có đúng 1 ô | Fail (không có ô này) |

Ví dụ một dòng trong `data/FR-01.json`:

```json
{ "id": "TC-FR01-DT-11", "title": "Reject password with 7 characters",
  "name": "Nguyen Van A", "email": "qa11@test.com", "password": "Abc1!xy",
  "expected": "weak-password" }
```

Script rẽ nhánh theo `expected`: `success` (URL + API), `missing-field` (validity + URL), `weak-password` (ô lỗi hiển thị + URL), `rejected` (URL + số user qua API). DT-21 không có dữ liệu nhập nên viết thành một test riêng dùng `toHaveCount(1)`.

Điểm cần ghi trong review: DT-05 và DT-09 xanh vì form từ chối mọi mật khẩu đúng chuẩn, không phải vì kiểm tra email. Đây là ví dụ "assertion yếu" mà AI không tự nhận ra.

Dọn dữ liệu: `beforeEach` xóa user có id > 2.

### 5.2 FR-07 Giỏ hàng (`/cart`)

Dựng giỏ: `goto('/')`, bấm nút "Thêm vào giỏ" trong thẻ sản phẩm (`page.locator('div.border', { hasText: 'iPhone 15 Pro Max' }).getByRole('button', { name: 'Thêm vào giỏ' })`), rồi bấm link "Giỏ hàng" trên header. Dòng giỏ: `tbody tr`.

| ID | Nội dung | Expected theo đặc tả | Dự đoán |
| --- | --- | --- | --- |
| DT-01 | Thêm 1 sản phẩm | 1 dòng, số lượng 1, thành tiền = đơn giá | Pass |
| DT-02 | Thêm cùng sản phẩm 2 lần | 1 dòng, số lượng 2 | Fail (tạo 2 dòng) |
| DT-04 | Nút `+` tăng số lượng | Có nút `+`, bấm thì số lượng 2 | Fail (không có nút) |
| DT-05 | Nút `−` giảm số lượng | Có nút `−` | Fail (không có nút) |
| DT-07 | Giỏ trống | Có thông báo và hình minh họa (`img` hoặc `svg`) | Fail (không có hình) |
| DT-08 | 2 sản phẩm khác nhau | 2 dòng, tổng = tổng 2 thành tiền | Pass |
| DT-09 | Hủy dialog xóa | Có dialog, sản phẩm còn | Fail (không có dialog) |
| DT-10 | Đồng ý dialog xóa | Có dialog, chỉ dòng đó mất | Fail (không có dialog) |
| DT-11 | Xóa sản phẩm cuối | Hiện màn hình giỏ trống | Pass nếu không assert dialog |
| DT-12 | "Tiếp tục mua sắm" | Có nút đúng tên, về `/`, giỏ giữ nguyên | Fail (nút tên "← Mua tiếp") |
| BVA-09 | MacBook × 3 | Tổng 135.000.000 ₫ | Tổng Pass, số dòng Fail |
| AT-01 (mới) | Nhãn bảng | 5 cột đúng tên và nhãn "Tổng cộng" | Fail ("Giá", "Tổng tạm tính") |

HW02 chỉ có 13 test case cho FR-07, nên AT-01 được thêm từ đặc tả để đủ 12; ghi rõ điều này trong report.

Kiểm tra dialog: đăng ký `page.on('dialog', d => { seen = true; d.dismiss(); })`, bấm "Xóa", rồi `expect(seen).toBe(true)`.

File dữ liệu chứa danh sách sản phẩm cần thêm và con số mong đợi, ví dụ `"add": ["MacBook Pro M3", "MacBook Pro M3", "MacBook Pro M3"], "expectedRows": 1, "expectedTotal": 135000000`. Không cần dọn dữ liệu vì giỏ không lưu ở backend.

### 5.3 FR-17 CRUD coupon (Admin, tab "Mã Giảm Giá")

Vào trang: `goto('http://localhost:5174')`, điền `getByPlaceholder('Email')` và `getByPlaceholder('Password')`, bấm nút trong form, chờ chữ "EShop Admin", bấm `getByText('Mã Giảm Giá', { exact: true })`. Ô nhập lấy theo placeholder: "Mã coupon (VD: SAVE10)", "Đơn tối thiểu (₫)", "Số lần dùng tối đa/người"; loại là `select`; ngày là `input[type="date"]`; nút "Tạo mã".

| ID | Nội dung | Expected theo đặc tả | Dự đoán |
| --- | --- | --- | --- |
| DT-01 | Tạo coupon percent hợp lệ | Có dòng mới, hiện "10%" | Pass |
| DT-02 | Tạo coupon fixed hợp lệ | Có dòng mới, hiện "5 lần" | Pass |
| DT-03 | Xóa coupon | Dòng biến mất | Pass |
| DT-24 | Tạo lại mã vừa xóa | Tạo được | Pass |
| DT-04 | Mã rỗng | Không tạo, ô báo thiếu | Pass |
| DT-06 | Mã trùng (`SAVE10`) | Có alert lỗi, số dòng không đổi | Pass |
| DT-07 | Giá trị giảm âm | Không tạo | Fail (vẫn tạo) |
| DT-08 | Giá trị giảm rỗng | Không tạo, ô báo thiếu | Pass |
| DT-10 | Ngày hết hạn rỗng | Không tạo, ô báo thiếu | Pass |
| DT-11 | Đơn tối thiểu âm | Không tạo | Fail (vẫn tạo) |
| BVA-02 | Giá trị giảm = 0 | Không tạo | Fail (vẫn tạo) |
| BVA-10 | Số lần dùng = 0 | Không tạo | Pass (ô có `min="1"`) |

Assertion chính: `page.locator('tr', { hasText: code })` với `toHaveCount(0)` hoặc `toHaveCount(1)`, nội dung ô trong dòng, và danh sách từ `GET /api/coupons`. Dọn dữ liệu: `beforeEach` xóa coupon có id > 4, nếu không browser thứ hai sẽ fail vì mã trùng.

Bug đã log ở HW02 vẫn cần issue cho HW04: mở issue mới gắn nhãn `HW04`, đính screenshot từ lần chạy tự động và dẫn link tới issue cũ.

## 6. Quang – FR-04, FR-09, FR-14

Các bảng dưới đây dựng từ đặc tả và mã nguồn, vì mình không có file HW02 của Quang. Quang ghép từng dòng với ID test case HW02 của mình; dòng nào HW02 chưa có thì đặt ID mới dạng `AT-xx` và ghi rõ trong report.

Hàm đăng nhập web dùng chung cho FR-04 và FR-09: `goto('/login')`, điền `label:has-text("Username") + input` và `label:has-text("Mật khẩu") + input`, bấm "Sign In", chờ chữ "Chào, Test User" trên header.

### 6.1 FR-04 Hồ sơ (`/profile`)

Sau khi đăng nhập, bấm link "Chào, Test User" và chờ tiêu đề "Hồ sơ của bạn". Kết quả cập nhật trả về bằng `alert`, nên mọi test đều cần bắt dialog.

| # | Nội dung | Expected theo đặc tả | Dự đoán |
| --- | --- | --- | --- |
| 1 | SĐT `0912345678` (10 số) | Alert "Cập nhật thành công!" | Fail (form từ chối số bắt đầu bằng 0) |
| 2 | SĐT `09123456789` (11 số) | Thành công | Fail |
| 3 | SĐT `091234567` (9 số) | Alert báo không hợp lệ | Pass |
| 4 | SĐT `091234567890` (12 số) | Alert báo không hợp lệ | Pass |
| 5 | SĐT `1912345678` (không bắt đầu bằng 0) | Alert báo không hợp lệ | Fail (được chấp nhận) |
| 6 | SĐT có chữ `09123abc78` | Alert báo không hợp lệ | Pass |
| 7 | SĐT có dấu gạch `0912-345-678` | Alert báo không hợp lệ | Pass |
| 8 | Họ Tên rỗng | Không cập nhật, ô báo thiếu | Pass |
| 9 | Ô Email bị khóa | `toBeDisabled()` | Pass |
| 10 | Ô Email hiện đúng email đăng nhập | `toHaveValue('test@eshop.com')` | Pass |
| 11 | Chưa đăng nhập mà vào `/profile` | Hiện "Vui lòng đăng nhập", không có form | Pass |
| 12 | Đổi Họ Tên + SĐT hợp lệ, tải lại trang | Ô giữ giá trị mới | Fail (kéo theo từ dòng 1) |

Dọn dữ liệu: `afterEach` gọi `PUT /api/users/me` với token của user test để trả tên về "Test User", SĐT và địa chỉ về rỗng.

### 6.2 FR-09 Mã giảm giá (trong `/checkout`)

Đường đi: đăng nhập → trang chủ → thêm "Bàn phím cơ Keychron Q1" (4.000.000 ₫) → link "Giỏ hàng" → "Tiến hành thanh toán". Ô mã: `getByPlaceholder('Nhập mã giảm giá...')`, nút "Áp dụng", lỗi hiện ở `p.text-red-600`.

Sản phẩm rẻ nhất là 4.000.000 ₫ nên giỏ hàng không thể chạm ngưỡng 300.000 hay 500.000. Các test biên phải sửa ô "Tổng tiền thanh toán" (`input[type="number"]`). Ô này sửa được là một lỗi của FR-08; ghi rõ trong report là test dựa vào nó.

| # | Mã | Tổng đơn | Expected theo đặc tả | Dự đoán |
| --- | --- | --- | --- | --- |
| 1 | `SAVE10` | 4.000.000 | Giảm 400.000, còn 3.600.000 | Fail (công thức phần trăm sai) |
| 2 | `BIGBUY` | 4.000.000 | Giảm 50.000, còn 3.950.000 | Pass |
| 3 | `VIP100` | 4.000.000 | Giảm 100.000, còn 3.900.000 | Pass |
| 4 | `EXPIRED` | 4.000.000 | Lỗi hết hạn | Pass |
| 5 | `ABCXYZ` | 4.000.000 | Lỗi mã không tồn tại | Pass |
| 6 | `BIGBUY` | 500.000 | Áp dụng được (đúng ngưỡng) | Fail (code dùng `>` thay vì `>=`) |
| 7 | `BIGBUY` | 499.999 | Lỗi chưa đủ giá trị tối thiểu | Pass |
| 8 | `BIGBUY` | 500.001 | Áp dụng được, còn 450.001 | Pass |
| 9 | `VIP100` | 300.000 | Áp dụng được, còn 200.000 | Fail |
| 10 | `VIP100` | 299.999 | Lỗi chưa đủ giá trị tối thiểu | Pass |
| 11 | (rỗng) | 4.000.000 | Nút "Áp dụng" bị khóa | Pass |
| 12 | Chưa đăng nhập | 4.000.000 | Không vào được checkout: có alert, chuyển sang `/login` | Pass |

Điều kiện C5 (hết lượt dùng) khó hơn: phải thanh toán xong rồi áp lại mã, và lượt dùng không xóa được qua API. Đưa vào mục "chưa tự động hóa" kèm lý do, hoặc làm thêm nếu còn thời gian và khởi động lại backend giữa các lượt chạy.

File dữ liệu: `code`, `total` (bỏ trống nếu dùng tổng của giỏ), `expected` (`applied` hoặc `error`), `discount`, `final`, `errorContains`. 12 test này không ghi gì vào database nên không cần dọn.

### 6.3 FR-14 CRUD danh mục (Admin, tab "Danh mục")

Đăng nhập admin như mục 5.3, bấm `getByText('Danh mục', { exact: true })`. Ô nhập `getByPlaceholder('Tên danh mục mới')`, nút "Thêm mới", dòng bảng `tbody tr`.

| # | Nội dung | Expected theo đặc tả | Dự đoán |
| --- | --- | --- | --- |
| 1 | Xem danh sách ban đầu | 3 dòng: Điện thoại, Laptop, Phụ kiện | Pass |
| 2 | Tiêu đề cột | ID, Tên Danh Mục, Hành động | Pass |
| 3 | Thêm tên hợp lệ "Đồng hồ" | Có dòng mới, tổng 4 dòng | Pass |
| 4 | Ô nhập sau khi thêm | Rỗng (`toHaveValue('')`) | Pass |
| 5 | Thêm tên rỗng | Không tạo, vẫn 3 dòng | Fail (tạo dòng trống) |
| 6 | Thêm tên chỉ có khoảng trắng | Không tạo | Fail |
| 7 | Thêm tên 1 ký tự | Tạo được | Pass |
| 8 | Thêm tên có dấu và ký tự đặc biệt "Gia dụng & Bếp" | Hiện đúng nguyên văn | Pass |
| 9 | Xóa danh mục vừa thêm | Dòng biến mất | Pass |
| 10 | Xóa 1 trong 2 danh mục vừa thêm | Chỉ dòng đó mất, dòng kia còn | Pass |
| 11 | Danh mục mới trong tab "Sản phẩm" | Có trong `select` của form sản phẩm | Pass |
| 12 | Tải lại trang sau khi thêm | Danh mục vẫn còn | Pass |

Dọn dữ liệu: `beforeEach` xóa danh mục có id > 3. Không xóa 3 danh mục seed trong test, vì sản phẩm đang trỏ tới chúng và bài của Phúc dùng chung backend nếu chạy cùng máy.

## 7. Phúc – FR-06, FR-08, FR-15

Cũng như phần của Quang, các bảng dựng từ đặc tả và mã nguồn; Phúc ghép với ID test case HW02 của mình và đặt `AT-xx` cho dòng mới.

### 7.1 FR-06 Chi tiết sản phẩm (`/product/:id`)

Đây là feature dễ nhất của cả nhóm: vào thẳng `goto('/product/1')`, không cần đăng nhập. Năm sản phẩm seed cho sẵn 5 dòng dữ liệu.

| # | Nội dung | Expected theo đặc tả | Dự đoán |
| --- | --- | --- | --- |
| 1–5 | Hiển thị sản phẩm id 1 → 5 | `h1` đúng tên, giá đúng, mô tả đúng, ảnh có `alt` = tên | Pass |
| 6 | Hiển thị danh mục | Thấy tên danh mục, ví dụ "Điện thoại" | Fail (trang không hiện danh mục) |
| 7 | Ô Số lượng mặc định | `toHaveValue('1')` | Pass |
| 8 | Ô Số lượng có giới hạn dưới | `toHaveAttribute('min', '1')` | Fail (không có `min`) |
| 9 | Bấm "Thêm vào giỏ hàng" 1 lần | Nút đổi thành "Đã thêm" | Fail (lần bấm đầu bị bỏ qua) |
| 10 | Số lượng 2, thêm, mở giỏ | Giỏ có 1 dòng số lượng 2 | Fail (giỏ trống) |
| 11 | Số lượng 0, thêm, mở giỏ | Giỏ trống | Pass nhưng sai lý do |
| 12 | Từ trang chủ bấm "Xem chi tiết" | URL `/product/1`, `h1` đúng tên | Pass |

File dữ liệu cho dòng 1–5: `id`, `name`, `price`, `description`, `category`, lấy từ seed trong `backend/database.js`. So giá sau khi bỏ ký tự không phải số. Mở giỏ bằng link "Giỏ hàng" trên header, không dùng `goto('/cart')`.

Dòng 11 xanh vì lần bấm đầu không thêm gì cả, không phải vì số lượng 0 bị chặn. Ghi điều này vào phần review.

### 7.2 FR-08 Checkout (`/checkout`)

Đường đi: đăng nhập (hàm ở mục 6) → trang chủ → "Thêm vào giỏ" → link "Giỏ hàng" → "Tiến hành thanh toán". Nút thanh toán: "Xác Nhận Thanh Toán".

| # | Nội dung | Expected theo đặc tả | Dự đoán |
| --- | --- | --- | --- |
| 1 | Chưa đăng nhập, bấm thanh toán ở giỏ | Có alert yêu cầu đăng nhập, URL `/login` | Pass |
| 2 | Đã đăng nhập | Vào `/checkout`, thấy "Xác Nhận Đơn Hàng" | Pass |
| 3 | Giỏ 1 sản phẩm | Danh sách có dòng "iPhone 15 Pro Max x 1" | Pass |
| 4 | Giỏ 2 sản phẩm | Danh sách `li` có 2 dòng | Pass |
| 5 | Tổng tiền 1 sản phẩm | 30.000.000 | Pass |
| 6 | Tổng tiền 2 sản phẩm khác nhau | Tổng của hai giá | Pass |
| 7 | Tổng tiền khi thêm 1 sản phẩm 2 lần | 2 × giá | Pass |
| 8 | Ô tổng tiền không sửa được | `not.toBeEditable()` | Fail (sửa được) |
| 9 | Thanh toán hợp lệ | Thấy "Thanh toán thành công!" | Pass |
| 10 | Giỏ sau khi thanh toán | Trống | Fail (giỏ còn nguyên) |
| 11 | Đơn mới trong lịch sử (`/profile`) | Có đơn trạng thái "Chờ xác nhận", tổng đúng | Pass |
| 12 | Sửa tổng thành 1000 rồi thanh toán | Đơn lưu tổng 30.000.000 (backend tự tính) | Fail (lưu 1000) |

Đơn hàng không có API xóa, nên số đơn tăng dần qua các lượt chạy. Dòng 11 và 12 chỉ assert trên đơn mới nhất (id lớn nhất, lấy từ `GET /api/orders/my-orders` hoặc dòng tương ứng trong bảng), không assert tổng số đơn.

File dữ liệu: `products` (danh sách tên cần thêm), `expectedItems`, `expectedTotal`, `editTotalTo` (nếu có).

### 7.3 FR-15 CRUD sản phẩm (Admin, tab "Sản phẩm")

Đăng nhập admin như mục 5.3, bấm `getByText('Sản phẩm', { exact: true })`. Ô nhập theo placeholder: "Tên sản phẩm", "Giá tiền", "URL Ảnh", "Mô tả"; danh mục là `select` (`selectOption({ label: 'Laptop' })`); nút "Lưu sản phẩm"; mỗi dòng có nút "Sửa" và "Xóa".

| # | Nội dung | Expected theo đặc tả | Dự đoán |
| --- | --- | --- | --- |
| 1 | Xem danh sách ban đầu | 5 sản phẩm seed | Pass |
| 2 | Thêm sản phẩm hợp lệ | Có dòng mới với tên và giá | Pass |
| 3 | Tên rỗng | Không tạo, ô báo thiếu | Pass |
| 4 | Giá rỗng | Không tạo | Fail (vẫn tạo) |
| 5 | Giá = 0 | Không tạo | Fail |
| 6 | Giá = −1 | Không tạo | Fail |
| 7 | Giá = 1 | Tạo được | Pass |
| 8 | Tên 255 ký tự | Tạo được | Pass |
| 9 | Tên 256 ký tự | Không tạo | Fail |
| 10 | Bấm "Sửa" trên sản phẩm test | Tiêu đề form "Sửa sản phẩm", các ô có sẵn giá trị | Pass |
| 11 | Sửa tên rồi lưu | Chỉ sản phẩm đó đổi tên; "iPhone 15 Pro Max" vẫn còn trong bảng | Fail (mọi dòng bị đổi tên trên giao diện) |
| 12 | Xóa sản phẩm test | Dòng mất, còn 5 sản phẩm seed | Pass |

Sinh tên 255 và 256 ký tự trong script từ trường `nameLength` của file dữ liệu (`'A'.repeat(n)`), không gõ tay chuỗi dài vào JSON. Sau khi lưu bản sửa, app hiện alert "Cập nhật thành công!"; bắt dialog trước khi bấm.

Dọn dữ liệu: `beforeEach` xóa sản phẩm có id > 5. Chỉ sửa và xóa sản phẩm do test tạo ra, không đụng vào 5 sản phẩm seed.

## 8. Quy trình AI-first cho mỗi feature

Đề cấm một prompt chung kiểu "viết hết script cho feature này"; phải dẫn AI qua từng bước và lưu lại từng lần hỏi. Làm 7 bước sau cho mỗi feature, mỗi bước một prompt do chính mình viết.

1. **Chọn test case.** Đưa cho AI phần đặc tả của feature và danh sách test case HW02, yêu cầu nó đề xuất 12 case tự động hóa được và nêu lý do loại các case còn lại. So với bảng ở mục 5–7 rồi tự quyết định.
2. **Khảo sát giao diện.** Đưa file `.jsx` của trang (hoặc HTML chụp từ DevTools) và yêu cầu AI liệt kê locator cho từng phần tử cùng lý do chọn. Kiểm tra từng locator bằng `npx playwright codegen http://localhost:5173`.
3. **Thiết kế file dữ liệu.** Yêu cầu AI đề xuất cấu trúc JSON cho 12 case, với `expected` theo đặc tả. Tự rà lại từng giá trị.
4. **Sinh khung script.** Yêu cầu AI viết file spec đọc dữ liệu từ JSON, có `beforeEach` dọn dữ liệu, chưa cần assertion đầy đủ. Chạy thử trên Chromium.
5. **Thêm assertion.** Yêu cầu AI thêm assertion cho từng loại `expected`, dùng ít nhất 3 kiểu ở mục 3.6.
6. **Chạy 3 browser và sửa.** Chạy Chromium, Firefox, WebKit. Với mỗi test đỏ, xác định là lỗi script hay lỗi của EShop. Lỗi script thì sửa; lỗi EShop thì giữ test đỏ và log bug.
7. **Review.** Đọc lại toàn bộ script, ghi bảng "AI sai gì / thiếu gì / vì sao / đã sửa thế nào" vào report.

Mỗi prompt và câu trả lời ghi ngay vào `ai/audit-report.md`: tên công cụ, ngày giờ, prompt, output. Làm sau sẽ không nhớ đủ.

### Bảng review cần có trong report

Mỗi feature cần vài dòng như dưới đây, lấy từ lỗi thật mà AI của bạn mắc. Các loại lỗi hay gặp với EShop:

| Loại lỗi của AI | Biểu hiện | Nguyên nhân thường gặp |
| --- | --- | --- |
| Selector dễ vỡ | Dùng `getByLabel` trong khi `label` không gắn với `input`; dùng class Tailwind dài | AI đoán cấu trúc HTML chuẩn, prompt không kèm mã trang |
| Mất trạng thái | `page.goto('/cart')` làm giỏ trống | AI không biết giỏ chỉ nằm trong bộ nhớ |
| Assertion yếu | Chỉ kiểm tra URL, nên test xanh vì lý do khác | Prompt không nói rõ cần xác nhận dữ liệu |
| Assertion theo hành vi hiện tại | AI đọc code rồi viết expected khớp với bug | Đưa mã nguồn mà không nhấn mạnh đặc tả là chuẩn |
| Chờ không ổn định | `waitForTimeout(1000)` | Thói quen của model; thay bằng `expect(...)` tự chờ |
| Bỏ sót dialog | Không bắt `alert` nên không đọc được thông báo | AI không thấy app dùng `alert` |
| Không dọn dữ liệu | Pass trên Chromium, fail trên Firefox | AI không biết 3 lượt chạy dùng chung database |
| Dữ liệu viết thẳng trong script | Mảng `cases = [...]` trong file spec | Không nêu yêu cầu file riêng |

### Agent Skill (10 điểm)

Sau khi xong feature đầu tiên, viết 7 bước trên thành một `SKILL.md` trong `skills/`, kèm các lưu ý ở mục 4. Dùng skill đó cho feature thứ hai hoặc thứ ba và quay video riêng cho lần dùng này. Mỗi người tự viết skill của mình.

## 9. Commit, video và checklist nộp bài

### 9.1 Kế hoạch commit

Cần ít nhất 8 commit có thay đổi trong file `.spec.js`. Chia nhỏ tự nhiên theo tiến độ thì được 9–12 commit:

1. Khung spec feature A + file dữ liệu.
2. Assertion cho feature A.
3. Sửa feature A sau review (selector, chờ, dọn dữ liệu).
4. Khung spec feature B + file dữ liệu.
5. Assertion cho feature B.
6. Sửa feature B sau review.
7. Khung spec feature C + file dữ liệu.
8. Assertion cho feature C.
9. Sửa feature C sau review.
10. Sửa lỗi chỉ xuất hiện trên Firefox hoặc WebKit.

Trước mỗi lần làm việc chạy `git pull`. Xuất log khi nộp: `git log --pretty=format:"%h | %ad | %an | %s" --date=iso > git-commit-log.txt`.

### 9.2 Video demo (15 điểm)

Video dài từ 5 phút, YouTube unlisted, tự thuyết minh bằng tiếng Việt. Trình tự gợi ý:

1. Mở terminal, chạy `whoami` và `hostname` (hoặc bật face-cam).
2. Giới thiệu feature, file dữ liệu và file spec trong 1 phút.
3. Chạy một file spec trên cả 3 browser: `npx playwright test tests/FR-xx.spec.js`.
4. Mở HTML report, chỉ vào dòng "Run by: MSSV" và timestamp, mở một test pass và một test fail.
5. Kể một lỗi của AI mà bạn đã sửa: cho xem đoạn code trước và sau (dùng `git diff` hoặc lịch sử commit).

Video Agent Skill là video thứ hai, quay cảnh dùng skill trên trọn một feature.

### 9.3 Checklist file nộp

- [ ] `report/main-report.md` và bản PDF: quy trình, 3 feature, review và gap analysis, test case chưa tự động hóa kèm lý do
- [ ] Link repo GitHub public (script, file dữ liệu, HTML report)
- [ ] 9 thư mục HTML report, mỗi report có "Run by: MSSV" và timestamp ISO
- [ ] Link video demo YouTube unlisted
- [ ] `ai/audit-report.md` và `ai/critique.md` (200–300 từ), kèm PDF
- [ ] `git-commit-log.txt`
- [ ] Bug report trong Markdown + issue trên GitHub có screenshot + ảnh chụp trang Issues
- [ ] `README.md`: bảng tự chấm điểm và test summary (số feature, số test tự động hóa / chạy / pass / fail, số lượt browser, số bug, link video)
- [ ] Thư mục `skills/` và link video Agent Skill
- [ ] File zip đặt tên `<MSSV>_HW04_AI_Automation_<điểm>.zip`, nộp Moodle trước hạn (không nhận nộp trễ)

### 9.4 Việc chung của nhóm

- Bug log tại trang Issues chung `kqanGit/eshop-sut`, tiêu đề `[FR-xx] Mô tả ngắn`, gắn nhãn tên người, FR và `HW04`.
- Không chia sẻ prompt, file spec hay AI Audit Report cho nhau. Có thể trao đổi về cách cài đặt và các bẫy ở mục 4.
- Mỗi người chạy backend riêng trên máy mình; không dùng chung một backend khi chạy test.
