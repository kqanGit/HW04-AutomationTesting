# HW04 – Bug Report

Bugs revealed by failing assertions in the automation suite. Each bug is also logged at https://github.com/kqanGit/HW04-AutomationTesting/issues (labels `bug`, `HW04`, the FR and `23120337`) with a screenshot.

| Bug ID | Feature | Title | Failing test | Browsers | GitHub issue |
|---|---|---|---|---|---|
| BUG-HW04-FR01-01 | FR-01 | Valid password is rejected as too weak, registration is impossible | TC-FR01-DT-01, DT-05, DT-09 | chromium, firefox, webkit | [#1](https://github.com/kqanGit/HW04-AutomationTesting/issues/1) |
| BUG-HW04-FR01-02 | FR-01 | Register form has no "Xác nhận mật khẩu" field | TC-FR01-DT-21 | chromium, firefox, webkit | [#2](https://github.com/kqanGit/HW04-AutomationTesting/issues/2) |

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
