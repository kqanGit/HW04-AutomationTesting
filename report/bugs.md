# HW04 – Bug Report

Bugs revealed by failing assertions in the automation suite. Each bug is also logged at https://github.com/kqanGit/HW04-AutomationTesting/issues (labels `bug`, `HW04`, the FR and `23120337`) with a screenshot.

| Bug ID | Feature | Title | Failing test | Browsers | GitHub issue |
|---|---|---|---|---|---|
| BUG-HW04-FR01-01 | FR-01 | Valid password is rejected as too weak, registration is impossible | TC-FR01-DT-01, DT-05, DT-09 | chromium, firefox, webkit | [#1](https://github.com/kqanGit/HW04-AutomationTesting/issues/1) |
| BUG-HW04-FR01-02 | FR-01 | Register form has no "Xác nhận mật khẩu" field | TC-FR01-DT-21 | chromium, firefox, webkit | [#2](https://github.com/kqanGit/HW04-AutomationTesting/issues/2) |
| BUG-HW04-FR07-01 | FR-07 | Adding the same product again creates a new cart row instead of increasing Số lượng | TC-FR07-DT-02, DT-08, BVA-09 | chromium, firefox, webkit | [#3](https://github.com/kqanGit/HW04-AutomationTesting/issues/3) |
| BUG-HW04-FR07-02 | FR-07 | "Xóa" removes a cart item immediately without a confirmation dialog | TC-FR07-DT-09, DT-10, DT-11 | chromium, firefox, webkit | [#4](https://github.com/kqanGit/HW04-AutomationTesting/issues/4) |
| BUG-HW04-FR07-03 | FR-07 | Số lượng column has no + / − buttons to change the quantity | TC-FR07-DT-04, DT-05, DT-01 | chromium, firefox, webkit | [#5](https://github.com/kqanGit/HW04-AutomationTesting/issues/5) |
| BUG-HW04-FR07-04 | FR-07 | Cart total is labelled "Tổng tạm tính" instead of "Tổng cộng" | TC-FR07-AT-01, DT-01 | chromium, firefox, webkit | [#6](https://github.com/kqanGit/HW04-AutomationTesting/issues/6) |
| BUG-HW04-FR07-05 | FR-07 | Cart column header shows "Giá" instead of "Đơn giá" | TC-FR07-AT-01, DT-01 | chromium, firefox, webkit | [#7](https://github.com/kqanGit/HW04-AutomationTesting/issues/7) |
| BUG-HW04-FR07-06 | FR-07 | Empty cart shows no illustration | TC-FR07-DT-07, DT-11 | chromium, firefox, webkit | [#8](https://github.com/kqanGit/HW04-AutomationTesting/issues/8) |
| BUG-HW04-FR07-07 | FR-07 | Cart with products has no "Tiếp tục mua sắm" button (only "← Mua tiếp") | TC-FR07-DT-12 | chromium, firefox, webkit | [#9](https://github.com/kqanGit/HW04-AutomationTesting/issues/9) |

<!-- Template for each bug:

## BUG-HW04-FRxx-01 – <title>
- Failing test: TC-...
- Steps to reproduce:
- Expected (spec):
- Actual:
- Evidence: reports/<feature>-<browser>/ (screenshot / trace)
- Related HW02 issue:
-->

## BUG-HW04-FR01-01 – Valid password is rejected as too weak, registration is impossible
- Failing test: TC-FR01-DT-01 (also TC-FR01-DT-05 and TC-FR01-DT-09, which are rejected by the password check before the email rule is reached)
- Browsers: chromium, firefox, webkit
- Steps to reproduce: open the web app, click "Đăng ký", enter Họ Tên `Nguyen Van A`, Email `qa01@test.com`, Mật khẩu `Abcdef1!`, click "Đăng Ký".
- Expected (spec): "Mật khẩu: Tối thiểu 8 ký tự, ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số, 1 ký tự đặc biệt." `Abcdef1!` is valid, so the account is created and the user goes to the Login page.
- Actual: the message "Mật khẩu quá yếu! …" appears, the page stays on `/register`, no account is created.
- Evidence: `report/github-issues-screenshots/BUG-HW04-FR01-01_DT-01_webkit.png`; reports/FR-01-{chromium,firefox,webkit}/ (screenshot + trace)
- GitHub issue: https://github.com/kqanGit/HW04-AutomationTesting/issues/1
- Related HW02 issue: https://github.com/kqanGit/eshop-sut/issues/6

## BUG-HW04-FR01-02 – Register form has no "Xác nhận mật khẩu" field
- Failing test: TC-FR01-DT-21
- Browsers: chromium, firefox, webkit
- Steps to reproduce: open the web app, click "Đăng ký", look at the form fields.
- Expected (spec): "Phải có trường Xác nhận mật khẩu". The form has exactly one "Xác nhận mật khẩu" input.
- Actual: the form has only Họ Tên, Email and Mật khẩu (locator count 0).
- Evidence: `report/github-issues-screenshots/BUG-HW04-FR01-02_DT-21_webkit.png`; reports/FR-01-{chromium,firefox,webkit}/
- GitHub issue: https://github.com/kqanGit/HW04-AutomationTesting/issues/2
- Related HW02 issue: https://github.com/kqanGit/eshop-sut/issues/7

## BUG-HW04-FR07-01 – Adding the same product again creates a new cart row instead of increasing Số lượng
- Failing test: TC-FR07-DT-02 (also TC-FR07-DT-08 and TC-FR07-BVA-09; the DT-05 setup also gives two rows)
- Browsers: chromium, firefox, webkit
- Steps to reproduce: open the web app, click "Thêm vào giỏ" twice on the card "iPhone 15 Pro Max", click "Giỏ hàng" in the header.
- Expected (spec): "Thêm cùng một sản phẩm vào giỏ sẽ tăng số lượng, không tạo dòng mới." One row, Số lượng 2, Thành tiền 60.000.000 ₫.
- Actual: two iPhone rows, each Số lượng 1 / 30.000.000 ₫ (row count 2). DT-08: 2 Keychron rows; BVA-09: 3 MacBook rows.
- Evidence: `report/github-issues-screenshots/BUG-HW04-FR07-01_DT-02_webkit.png`; reports/FR-07-{chromium,firefox,webkit}/
- GitHub issue: https://github.com/kqanGit/HW04-AutomationTesting/issues/3
- Related HW02 issue: https://github.com/kqanGit/eshop-sut/issues/8

## BUG-HW04-FR07-02 – "Xóa" removes a cart item immediately without a confirmation dialog
- Failing test: TC-FR07-DT-09, TC-FR07-DT-10, TC-FR07-DT-11
- Browsers: chromium, firefox, webkit
- Steps to reproduce: add "Tai nghe AirPods Pro 2" from the home page, open "Giỏ hàng", click "Xóa" on the row.
- Expected (spec): "Nút Xóa sản phẩm phải có dialog xác nhận trước khi thực hiện." A dialog appears before removal; cancel keeps the row.
- Actual: no native dialog and no element with role `dialog`; the row is removed at once (DT-09 ends with an empty cart).
- Evidence: `report/github-issues-screenshots/BUG-HW04-FR07-02_DT-09_webkit.png`; reports/FR-07-{chromium,firefox,webkit}/
- GitHub issue: https://github.com/kqanGit/HW04-AutomationTesting/issues/4
- Related HW02 issue: https://github.com/kqanGit/eshop-sut/issues/9

## BUG-HW04-FR07-03 – Số lượng column has no + / − buttons to change the quantity
- Failing test: TC-FR07-DT-04, TC-FR07-DT-05, TC-FR07-DT-01
- Browsers: chromium, firefox, webkit
- Steps to reproduce: add "iPhone 15 Pro Max" from the home page, open "Giỏ hàng", look at the Số lượng cell.
- Expected (spec): "Số lượng (có nút +/- để chỉnh)". Pressing + gives Số lượng 2, Thành tiền and Tổng cộng 60.000.000 ₫.
- Actual: the cell shows only `1`; no button named + or − in the row (count 0).
- Evidence: `report/github-issues-screenshots/BUG-HW04-FR07-03_DT-04_webkit.png`; reports/FR-07-{chromium,firefox,webkit}/
- GitHub issue: https://github.com/kqanGit/HW04-AutomationTesting/issues/5
- Related HW02 issue: https://github.com/kqanGit/eshop-sut/issues/10

## BUG-HW04-FR07-04 – Cart total is labelled "Tổng tạm tính" instead of "Tổng cộng"
- Failing test: TC-FR07-AT-01, TC-FR07-DT-01
- Browsers: chromium, firefox, webkit
- Steps to reproduce: add "iPhone 15 Pro Max" from the home page, open "Giỏ hàng", read the total label.
- Expected (spec): "Tổng tiền hiển thị nhãn chính xác: "Tổng cộng" (không phải "Tổng tạm tính")."
- Actual: "Tổng tạm tính: 30.000.000 ₫"; "Tổng cộng" not on the page.
- Evidence: `report/github-issues-screenshots/BUG-HW04-FR07-04_AT-01_webkit.png`; reports/FR-07-{chromium,firefox,webkit}/
- GitHub issue: https://github.com/kqanGit/HW04-AutomationTesting/issues/6
- Related HW02 issue: https://github.com/kqanGit/eshop-sut/issues/11

## BUG-HW04-FR07-05 – Cart column header shows "Giá" instead of "Đơn giá"
- Failing test: TC-FR07-AT-01, TC-FR07-DT-01
- Browsers: chromium, firefox, webkit
- Steps to reproduce: add "iPhone 15 Pro Max" from the home page, open "Giỏ hàng", read the table header.
- Expected (spec): "các cột: Sản phẩm, Đơn giá, Số lượng (có nút +/- để chỉnh), Thành tiền, Thao tác".
- Actual: headers Sản phẩm, Giá, Số lượng, Thành tiền, Thao tác.
- Evidence: `report/github-issues-screenshots/BUG-HW04-FR07-05_DT-01_webkit.png`; reports/FR-07-{chromium,firefox,webkit}/
- GitHub issue: https://github.com/kqanGit/HW04-AutomationTesting/issues/7
- Related HW02 issue: https://github.com/kqanGit/eshop-sut/issues/12

## BUG-HW04-FR07-06 – Empty cart shows no illustration
- Failing test: TC-FR07-DT-07, TC-FR07-DT-11
- Browsers: chromium, firefox, webkit
- Steps to reproduce: open the web app and click "Giỏ hàng" without adding anything.
- Expected (spec): "Giỏ hàng trống phải có hình minh họa và thông báo rõ ràng."
- Actual: only the heading "Giỏ hàng của bạn đang trống" and the link "Tiếp tục mua sắm"; no img or svg in the page content (count 0).
- Evidence: `report/github-issues-screenshots/BUG-HW04-FR07-06_DT-07_webkit.png`; reports/FR-07-{chromium,firefox,webkit}/
- GitHub issue: https://github.com/kqanGit/HW04-AutomationTesting/issues/8
- Related HW02 issue: https://github.com/kqanGit/eshop-sut/issues/13

## BUG-HW04-FR07-07 – Cart with products has no "Tiếp tục mua sắm" button (only "← Mua tiếp")
- Failing test: TC-FR07-DT-12
- Browsers: chromium, firefox, webkit
- Steps to reproduce: add "iPhone 15 Pro Max" from the home page, open "Giỏ hàng", look for "Tiếp tục mua sắm".
- Expected (spec): "Có nút Tiếp tục mua sắm để quay về trang chủ."
- Actual: no link or button named "Tiếp tục mua sắm" on the cart with products (element not found); the only link back is "← Mua tiếp".
- Evidence: `report/github-issues-screenshots/BUG-HW04-FR07-07_DT-12_webkit.png`; reports/FR-07-{chromium,firefox,webkit}/
- GitHub issue: https://github.com/kqanGit/HW04-AutomationTesting/issues/9
- Related HW02 issue: https://github.com/kqanGit/eshop-sut/issues/14
