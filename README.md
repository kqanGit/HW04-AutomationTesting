# HW04 – Automation Testing on EShop

- Student: Bùi Minh Quân – **23120337** (Nhóm 09)
- SUT: EShop – https://github.com/ttbhanh/eshop-sut (fork `kqanGit/eshop-sut`)
- Tool: Playwright (JavaScript) + Playwright HTML reporter
- GitHub repository: https://github.com/kqanGit/HW04-AutomationTesting
- GitHub Issues: https://github.com/kqanGit/eshop-sut/issues

## Features (same as HW02)

| Pool | Feature | Spec | Data |
|---|---|---|---|
| A | FR-01 Đăng ký tài khoản | `tests/FR-01.spec.js` | `data/FR-01.json` |
| B | FR-07 Giỏ hàng | `tests/FR-07.spec.js` | `data/FR-07.json` |
| C | FR-17 Quản lý mã giảm giá | `tests/FR-17.spec.js` | `data/FR-17.json` |

## Self-assessment

| No. | Criteria | Grade | Self-assessed |
|---|---|---|---|
| 1 | Task 1 – Feature A (FR-01) | 25 | |
| 1 | Task 1 – Feature B (FR-07) | 25 | |
| 1 | Task 1 – Feature C (FR-17) | 25 | |
| 2 | Task 2 – Demo video | 15 | |
| 3 | Agent Skills | 10 | |
| | **Total** | **100** | |

## Test summary report

- Number of features: 3
- Browser runs: _TODO_ (3 features × Chromium, Firefox, WebKit)
- Bugs: _TODO_

| Feature | Automated | Executed | Passed | Failed | Bugs |
|---|---|---|---|---|---|
| FR-01 | | | | | |
| FR-07 | | | | | |
| FR-17 | | | | | |
| **Total** | | | | | |

## Demo videos

- Automation demo: _TODO: unlisted YouTube link_
- Agent Skill demo: _TODO: unlisted YouTube link_

## How to run

1. Start EShop: `tools\start-eshop.bat` (backend 3000, web 5173, admin 5174).
2. `npm install` then `npx playwright install chromium firefox webkit` (first time only).
3. All 9 runs: `node run-all.js` – one feature: `node run-all.js FR-01`.
4. Open a report: `npx playwright show-report reports/FR-01-chromium`.

Restart the backend (`tools\restart-backend.bat`) to reset the database to seed data.

## Contents

- `tests/` – automation scripts · `data/` – test data files · `helpers/` – shared helpers
- `reports/` – 9 HTML reports (`<feature>-<browser>/index.html`), each shows "Run by: 23120337"
- `report/` – main report (MD + PDF), bug report, GitHub Issues screenshots
- `ai/` – AI Audit Report, AI Critique
- `skills/` – Agent Skill
- `docs/` – assignment statement
- `git-commit-log.txt`
