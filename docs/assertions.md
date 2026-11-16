# Assertion catalogue – FR-01, FR-07, FR-17

Copied from the header comment of each `tests/FR-xx.spec.js`. Assertions are listed in the order they run.
Pattern names follow the catalogue of the `playwright-data-driven` skill: URL, visibility, content/text, count,
input value/attribute, field validity, dialog, data state via API. "(hard)" = a normal `expect`, which stops the
test when it fails; all other checks in FR-07 and FR-17 are soft.

## FR-01 Đăng ký tài khoản

Every case first: users with id > 2 are deleted through the API, then `/register` is opened. All 12 cases run in
the data loop. DT-21 is a data row, not a standalone test.

| Expected type | Case ids | Assertions | Pattern | Spec sentence |
|---|---|---|---|---|
| `success` | DT-01 | 1. URL ends with `/login` | URL | "Sau khi đăng ký thành công, người dùng được chuyển tới trang Đăng nhập." (trace: FR-01 · P1, P4, P12, P21) |
| | | 2. API: exactly one user with the row's email | Data state | |
| | | 3. API login with the row's email + password → 200 | Data state | |
| `missing-field` | DT-02, DT-04, DT-17 | 1. `validity.valueMissing` of the empty field is `true` | Field validity | "Người dùng phải cung cấp: Họ Tên, Email, Mật khẩu." |
| | | 2. URL still ends with `/register` | URL | |
| | | 3. API: no user with id > 2 | Data state | |
| `weak-password` | DT-11, DT-12, DT-13, DT-14, DT-15 | 1. Error box visible | Visibility | "Yêu cầu mật khẩu mạnh: Tối thiểu 8 ký tự, có ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt" |
| | | 2. URL still ends with `/register` | URL | |
| | | 3. API: no user with id > 2 | Data state | |
| `rejected-email` | DT-05, DT-09 | 1. Error box visible | Visibility | "Email phải có định dạng hợp lệ (`user@domain.com`) và là duy nhất trong hệ thống." |
| | | 2. Error box does **not** contain "Mật khẩu quá yếu" (negative guard) | Content/text | |
| | | 3. URL still ends with `/register` | URL | |
| | | 4. API: no user with id > 2 | Data state | |
| | DT-09 only | 5. API: exactly one user with that email (case-insensitive) | Data state | |
| | DT-09 only | 6. API login with the existing password → 200 | Data state | |
| `has-confirm-field` | DT-21 | 1. Exactly 1 input after the label "Xác nhận mật khẩu" | Count | "Phải có trường Xác nhận mật khẩu" |

**Not asserted:**
- `success`: no success message (the spec gives none).
- `missing-field`: the browser bubble text, which differs between browsers.
- `weak-password`, `rejected-email`: the error wording, because the spec does not fix it. The weak-password guard only catches a row refused for the wrong reason.
- DT-21: the "không khớp" (mismatch) rule, which cannot run while the field is missing.

## FR-07 Giỏ hàng

Every case first: the home heading is visible (visibility), the products are added from the home page, the cart
is opened from the header link, the URL ends with `/cart` (URL), and the first row is visible (visibility). These
are preconditions. All 13 cases run in the data loop. Money is compared as digits only.

| Expected type | Case ids | Assertions | Pattern | Spec sentence |
|---|---|---|---|---|
| `rows-and-totals` | DT-02, DT-08, BVA-09, AT-02 | 1. Number of rows = `rows.length` | Count | "Hiển thị danh sách sản phẩm với các cột: Sản phẩm, Đơn giá, Số lượng (có nút +/- để chỉnh), Thành tiền, Thao tác" · "Thêm cùng một sản phẩm vào giỏ sẽ tăng số lượng, không tạo dòng mới" |
| | | 2. Exactly one row per product | Count | |
| | | 3. Đơn giá = `unitPrice` | Content/text | |
| | | 4. Số lượng = `quantity` (input value if the cell is an `<input>`) | Content/text (input value) | |
| | | 5. Thành tiền = `lineTotal` | Content/text | |
| | | 6. Grand total (polled) = `total` or sum of `lineTotal` | Content/text | |
| `overview` | DT-01 | 1–6. as `rows-and-totals` | Count, content/text | same as above · "Tổng tiền hiển thị nhãn chính xác: "Tổng cộng"" |
| | | 7. Column headers = `columns` | Content/text | |
| | | 8–9. One "+" and one "−" button in the row | Count | |
| | | 10. Label "Tổng cộng" visible | Visibility | |
| `quantity-button` | DT-04, DT-05 | 1. Exactly one `+`/`−` button in the row (hard) | Count | "Số lượng (có nút +/- để chỉnh)" |
| | | 2. Quantity after click = `quantityAfter` | Content/text (input value) | |
| | | 3. Thành tiền after click = `lineTotalAfter` | Content/text | |
| | | 4. Grand total after click = `totalAfter` | Content/text | |
| `empty-cart` | DT-07 | 1. Text /giỏ hàng … trống/i visible | Visibility | "Giỏ hàng trống phải có hình minh họa và thông báo rõ ràng" |
| | | 2. No `<table>` in main | Count | |
| | | 3. At least one img/svg in main | Count | |
| `remove-dialog` | DT-09, DT-10 | 1. A native dialog or `role="dialog"` shown after Xóa | Dialog | "Nút Xóa sản phẩm phải có dialog xác nhận trước khi thực hiện" |
| | | 2. Remaining row names = `rowsAfter` | Content/text | |
| | | 3. Grand total = `totalAfter` | Content/text | |
| `remove-to-empty` | DT-11 | 1. Confirmation shown (accepted) | Dialog | "Nút Xóa sản phẩm phải có dialog xác nhận trước khi thực hiện" · "Giỏ hàng trống phải có hình minh họa và thông báo rõ ràng" |
| | | 2–4. as `empty-cart` | Visibility, count | |
| `continue-shopping` | DT-12 | 1. Link/button "Tiếp tục mua sắm" visible (hard) | Visibility | "Có nút Tiếp tục mua sắm để quay về trang chủ" |
| | | 2. URL is `/` | URL | |
| | | 3. Heading "Danh sách sản phẩm" visible | Visibility | |
| | | 4–9. Cart reopened: as `rows-and-totals` | Count, content/text | |
| `labels` | AT-01 | 1. Column headers = `columns` | Content/text | columns "Sản phẩm, Đơn giá, Số lượng, Thành tiền, Thao tác" · "Tổng cộng (không phải Tổng tạm tính)" |
| | | 2. "Tổng cộng" visible | Visibility | |
| | | 3. No "Tổng tạm tính" | Count | |

**Not asserted:**
- Money: the currency format and separators.
- Rows: the row order and the images.
- Dialog: its text, and whether it is `confirm()` or a modal.
- Empty cart: the exact wording of the message.
- Quantity: "−" at quantity 1, because the spec does not say what it should do.
- Totals: Thành tiền = Đơn giá × Số lượng and the grand total are derived from the spec, not quoted from it.

## FR-17 Quản lý Mã Giảm Giá

Every data-loop case first: coupons with id > 4 are deleted through the API, the admin logs in and opens the tab,
and the heading "Quản lý Mã Giảm Giá" is visible (visibility, precondition). The steps only record their outcome in
the "Steps result" annotation and assert nothing.

| Expected type | Case ids | Assertions | Pattern | Spec sentence |
|---|---|---|---|---|
| `created` | DT-01, DT-02, DT-24, BVA-03 | 1. API: exactly one coupon with the code (hard) | Data state | "Admin có thể Thêm / Xem / Xóa mã giảm giá" · "Các trường bắt buộc: `code` (duy nhất), `type` (percent/fixed), `discount_value` (dương), `expired_at`, `min_order_amount` (>= 0), `max_uses_per_user` (>= 1)" |
| | | 2. API: 4 seed + 1 coupons | Data state | |
| | | 3. Saved type, discount_value, min_order_amount, expired_at, max_uses_per_user = row | Data state | |
| | | 4. Exactly one table row for the code (hard) | Count | |
| | | 5. Giá trị, Đơn tối thiểu, Giới hạn/người cells = row (digits) | Content/text | |
| `rejected` | DT-04, DT-05, DT-06, DT-08, DT-10, DT-12, DT-15, BVA-02, BVA-08, BVA-10 | 1. API: no coupon besides the 4 seed coupons | Data state | "Các trường bắt buộc: …" (the broken rule of each row is in its `trace`) |
| `deleted` | DT-03 | 1. API: no coupon with the code (hard) | Data state | "Admin có thể Thêm / Xem / Xóa mã giảm giá" |
| | | 2. API: exactly the 4 seed coupons | Data state | |
| | | 3. No table row for the code | Count | |
| DT-17 (standalone) | DT-17 | (precondition: an alert fired or "EShop Admin" appeared) | – | "Admin có thể Thêm / Xem / Xóa mã giảm giá" |
| | | 1. No tab "Mã Giảm Giá" for a customer | Count | |
| | | 2. No heading "Quản lý Mã Giảm Giá" | Count | |

**Not asserted:**
- `created`: the alert texts, and how Loại and Hết hạn are displayed (checked in the saved data instead).
- `rejected`: which field was refused, the message, the HTTP status, and whether the browser or the backend refused it. Each row has exactly one invalid value, so the saved data is enough.
- `deleted`: a confirmation dialog, which FR-17 does not require.
- DT-17: the coupon API called with a customer token. The test checks the UI only (see `report/bugs.md`).

## Patterns per feature

| Pattern | FR-01 | FR-07 | FR-17 |
|---|:-:|:-:|:-:|
| URL | ✔ | ✔ | – |
| Visibility | ✔ | ✔ | ✔ (precondition only) |
| Content/text | ✔ | ✔ | ✔ |
| Count | ✔ | ✔ | ✔ |
| Input value / attribute | – | ✔ (only when Số lượng is an `<input>`) | – |
| Field validity | ✔ | – | – |
| Dialog | – | ✔ | – |
| Data state via API | ✔ | – (cart is React state) | ✔ |
| **Distinct patterns** | **6** | **5 + 1 conditional** | **4 (3 as verdicts)** |
