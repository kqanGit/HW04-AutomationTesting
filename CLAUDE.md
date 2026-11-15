# HW04 – Automation Testing on EShop (project notes for Claude Code)

Student: Bùi Minh Quân – 23120337 (Nhóm 09). Individual homework for the Software Testing course, HCMUS.
Assignment statement: `docs/2026.HW04.Automation Testing_En.md` – read it before any task.

## Scope
- Features (same as HW02): FR-01 Đăng ký, FR-07 Giỏ hàng, FR-17 Quản lý mã giảm giá.
- HW02 material (test cases to convert): `E:\just_write_some_code\Software Testing\HW2\features\`.
- SUT source: `E:\just_write_some_code\Software Testing\Seminar\eshop-sut` (spec = its README). Never modify the SUT.
- EShop: backend :3000, web :5173, admin :5174. Start with `tools\start-eshop.bat`; `tools\restart-backend.bat` resets the database to seed data.

## Rules from the assignment
- At least 12 automated test cases per feature, data in `data/FR-xx.json` (no inline arrays in spec files), at least 3 distinct assertion patterns.
- Each feature runs on chromium, firefox, webkit: `node run-all.js` writes 9 reports to `reports/<feature>-<browser>/`. Every report must show "Run by: 23120337" and an ISO timestamp. Reports must come from real runs; never edit them by hand.
- AI-first, step by step: one step per prompt (select cases → inspect UI → design data file → script skeleton → assertions → 3-browser run → review). Do not generate a whole feature from one prompt.
- `expected` values follow the spec, not the current behaviour. A red test caused by a real EShop defect stays red and becomes a bug report (`report/bugs.md` + GitHub issue with screenshot). Do not weaken assertions to make tests pass.
- At least 8 commits that change `.spec.js` files: commit after each step.

## Working conventions
- After every AI step, append a row to `ai/audit-report.md` (tool, date & time UTC+7, the prompt verbatim, output summary). Leave the "My review" column for the student.
- Record every AI mistake that was corrected (fragile selector, weak assertion, flaky wait, missing cleanup…) for the review tables in `report/main-report.md`.
- Git: user.name `kqanGit`, user.email `bmquan.gd@gmail.com`, remote `git@main_acc:kqanGit/HW04-AutomationTesting.git`. Commit messages and PR descriptions must not mention Claude or Claude Code and must not carry a Co-Authored-By line.
- Run `git pull` before starting work.
- Shared helpers live in `helpers/common.js` (environment control and navigation only; assertions stay in spec files).

## EShop pitfalls
- The cart lives in React state: `page.goto` or a reload empties it. Navigate with header links.
- Inputs have no id/name; labels are not linked. Web: `label:has-text("…") + input`. Admin: `getByPlaceholder`.
- Many results arrive through `alert()`: register `page.on('dialog', …)` before clicking.
- Empty `required` fields are blocked by the browser: assert `validity.valueMissing` and the URL, not the bubble text.
- The database is shared by the three browser runs: clean test data through the API in `beforeEach` (users id > 2, coupons id > 4).

## Status
- Scaffold done: config, runner, helpers, report templates. `tests/` and `data/` are empty.
- Not done yet: `npm install`, Playwright browsers, `git init`, GitHub repository, first commit and push (`tools\setup.bat` contains the exact commands).
