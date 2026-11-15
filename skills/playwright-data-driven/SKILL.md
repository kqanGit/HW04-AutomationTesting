---
name: "playwright-data-driven"
description: "Turn the confirmed test cases of one web feature into a data-driven Playwright suite that runs on Chromium, Firefox and WebKit, one human-confirmed step at a time, then triage failures, log bugs and record the AI review."
---

# Data-driven, multi-browser Playwright automation (HW04 — EShop)

Use this skill when the user asks to automate one feature (for example "automate FR-17") or to continue or maintain an automated feature.

Input: a feature ID, its spec section (EShop `README.md`), and its designed test cases (HW02 `features/FR-xx-*/test-cases.md`).

Output for the feature:

- `data/FR-xx.json` — test data and expected results
- `tests/FR-xx.spec.js` — data-driven script
- `reports/FR-xx-{chromium,firefox,webkit}/` — three HTML reports from real runs
- report sections in `report/main-report.md`, bug entries in `report/bugs.md`, rows in `ai/audit-report.md`

Reply in the user's language (usually Vietnamese). Use English for IDs, test titles, code, commit messages and issue text.

## Ground rules

1. **One step per turn.** The workflow has eight steps. Do one step, show the result, then stop and wait for the user's confirmation or corrections. Never produce a whole feature from one request, even if asked "do everything": explain that the assignment requires step-by-step guidance and start with step 1.
2. **The spec is the oracle.** Every expected result must be traceable to a sentence in the spec, quoted in the step-1 table. Source code and the running UI are read only to find locators and to control the environment. If the spec is silent (for example the exact wording of an error message), do not assert it; list it as an open question for the user.
   **Exception, documented negative guard:** the tester may approve a negative assertion on text the spec does not define when its only purpose is to detect a masked result (a rejection for the wrong reason, for example `expect(errorBox).not.toContainText('Mật khẩu quá yếu')` in a row whose password is valid). It must never be the only check of the expected behaviour, it must carry a comment in the spec file saying it is a tester's decision and what it guards against, and the decision is recorded in the audit log.
3. **Data lives in a file.** Inputs and expected results go in `data/FR-xx.json`. The spec file contains no inline case arrays. Values that are generated (a 255-character name) are described in the data (`"nameLength": 255`) and built in the script.
4. **At least three distinct assertion patterns** per feature, chosen from the catalogue below and listed in a comment at the top of the spec file.
5. **A red test from a real defect stays red.** Never weaken an assertion, add a retry, click twice, or add a workaround to turn a real defect green. Fix the script only when the script is wrong.
6. **Reports come from real runs** on the user's machine through `node run-all.js`. Never edit or fabricate a report. Each report must show "Run by: <StudentID>" and an ISO timestamp.
7. **Leave no trace.** Each test starts from seed data: clean test-created records through the API in `beforeEach`. Never modify or delete seed records. Never modify the SUT.
8. **Audit as you go.** After each step, append one row to `ai/audit-report.md` (format below) and add any AI mistake found to the feature's review notes.
9. **Ask before public actions.** Creating GitHub issues and pushing are visible to others: ask first unless the user already told you to.

## Workflow

Each step ends with **Checkpoint** (what to show, then stop) and, where a spec file changed, **Commit**.

### Step 0 — Preflight (no confirmation needed unless something fails)

- `git pull`.
- Check EShop answers: `http://localhost:3000/api/products`, `http://localhost:5173`, `http://localhost:5174`. If not, ask the user to run `tools\start-eshop.bat`.
- Read: the feature's spec section, its HW02 test cases, `helpers/common.js`, `playwright.config.js`, and the last `A<n>` in `ai/audit-report.md`.

### Step 1 — Select test cases

Build a table of candidates from the HW02 test cases: `ID · title · spec sentence (quoted) · automatable? · reason`.

Prefer cases that are deterministic, need little setup, and have an observable result. Exclude, with a reason: cases needing a state the UI cannot reach, values an input cannot accept (text in `type="number"`), timing-dependent cases, and "observe only" cases with no spec-backed verdict. If HW02 has fewer than 12 usable cases, propose new ones from the spec with IDs `TC-FRxx-AT-nn` and mark them as new.

**Checkpoint:** show the table and the proposed 12 or more. The user picks the final list.

### Step 2 — Inspect the UI and choose locators

For every element the selected cases touch, propose a locator and say why. Priority:

1. role + accessible name (`getByRole('button', { name: 'Tạo mã' })`)
2. placeholder or visible label text
3. structure relative to stable text (`label:has-text("Email") + input`, `tr` filtered by cell text)
4. CSS class only when nothing else exists; flag it as fragile

Also record: how the page reports results (inline message, `alert()`, redirect, table change), which state is kept in memory, and what the feature writes to the database.

**Checkpoint:** show the locator table and the fragile ones. Ask the user to verify doubtful locators with `npx playwright codegen <url>`.

### Step 3 — Design the data file

Write `data/FR-xx.json`: an array with one object per case.

- Required keys: `id`, `title`, `expected`.
- Input keys named after the fields.
- `expected` is a short outcome type shared by several cases (for example `created`, `rejected`, `missing-field`), not a UI message. Add extra keys a check needs (`missingField`, `expectedRows`, `expectedTotal`).
- Cases with no input data (for example "the form has field X") are not forced into the file; they become standalone tests.

**Checkpoint:** show the file as a table and, for each `expected` type, the spec sentence behind it. No spec file yet.

### Step 4 — Script skeleton

Write `tests/FR-xx.spec.js`:

- header comment: feature, data file, assertion patterns planned
- `require` the data file and `helpers/common.js`
- `test.beforeEach`: `tagRunBy(testInfo)` and the cleanup for this feature
- one loop `for (const c of cases) test(`${c.id} – ${c.title}`, ...)` that performs the steps only
- an empty `checks` object with one function per `expected` type, called as `checks[c.expected](...)`; alternatively a `switch (c.expected)` with one `case` per type and a `default` that throws (`Unknown expected value`), so a typo in the data file fails the test instead of silently checking nothing
- standalone tests for cases without data

Run it on one browser: `npx playwright test tests/FR-xx.spec.js --project=chromium`. At this point tests only prove that the steps execute.

**Checkpoint:** show the run output and any step that could not be driven. **Commit:** `FR-xx: data file and data-driven script skeleton`.

### Step 5 — Assertions

Fill each `checks` function (or `switch` case). Each assertion carries a one-line comment naming the spec sentence it verifies.

Assertion catalogue (use at least three kinds):

| Pattern | Example | Verifies |
|---|---|---|
| URL | `await expect(page).toHaveURL(/\/login$/)` | navigation |
| Visibility | `await expect(locator).toBeVisible()` | a message or control is shown |
| Content | `await expect(cell).toHaveText('10%')` | displayed value or label |
| Count | `await expect(rows).toHaveCount(1)` | number of rows or elements |
| Input value / attribute | `toHaveValue('')`, `toHaveAttribute('min', '1')` | form state, HTML constraints |
| Field validity | `expect(await el.evaluate(e => e.validity.valueMissing)).toBe(true)` | required field blocked by the browser |
| Dialog | `expect(dialogMessage).toContain('...')` | `alert` / `confirm` behaviour |
| Data state | `expect(list.some(x => x.code === c.code)).toBe(false)` after an API read | what was really saved |

Rules:

- A "rejected" case must prove nothing was saved (data state), not only that the URL did not change.
- No `waitForTimeout`. Use web-first assertions or `expect.poll`. Before asserting that something did *not* happen, wait for a positive signal that the page has reacted.
- Register `page.on('dialog', ...)` before the click that triggers it.
- Compare money as numbers: strip non-digits first (`toNumber`).

Run on Chromium again.

**Checkpoint:** show pass/fail per case and the assertion patterns used. **Commit:** `FR-xx: assertions for <n> test cases`.

### Step 6 — Three browsers and triage

Run `node run-all.js FR-xx`. For every failing test on any browser, classify it:

| Class | Evidence | Action |
|---|---|---|
| Script fault | wrong locator, race, missing cleanup, wrong data | fix the script, rerun |
| Browser difference in the script | passes on some browsers only, cause is in the test | fix the script, note the browser |
| SUT defect | the app contradicts a quoted spec sentence | keep red, draft a bug |
| Spec ambiguity | the spec does not decide | ask the user; do not guess |

Also check the opposite risk: a test that passes for the wrong reason (another defect masks the behaviour). Report these as weak or masked assertions.

Open one report and confirm "Run by" and the timestamp are visible.

**Checkpoint:** show the triage table and proposed fixes. Apply fixes only after confirmation, rerun, and show the final 3-browser result. **Commit:** `FR-xx: fix <what> after multi-browser run` (one commit per kind of fix).

### Step 7 — Review, bugs and report

- **Review table** for `report/main-report.md`: `what the AI got wrong or missed · why (prompt quality / model limitation / feature characteristic) · fix`. Use real items found in steps 2–6: fragile selector, lost state, weak or masked assertion, expectation copied from current behaviour, flaky wait, missed dialog, missing cleanup, inline data.
- **Bugs:** for each SUT defect, draft an entry in `report/bugs.md` (steps, expected with spec quote, actual, failing test ID, browsers, evidence path). After the user confirms, create a GitHub issue titled `[FR-xx] <short description>` with labels for the student, the FR and `HW04`, attach the failure screenshot from the report, and link any earlier issue for the same defect.
- **Report sections:** fill the feature's tables (cases with three browser results, data file and assertion patterns, cases not automated with reasons) and the nine-run table.
- **README:** update the test summary numbers.

**Checkpoint:** show the drafts. The user decides every bug and every review statement.

## Audit log format

Append to the table in `ai/audit-report.md`, one row per step:

`| A<n> | <tool and model> | <dd/mm/yyyy hh:mm, UTC+7> | "<the user's prompt, verbatim>" | <what was produced and where it is used> | _TODO_ |`

- `<n>` continues from the highest number in the file. If two rows share a number, renumber the later one before adding yours.
- The last column is the student's review; never fill it.

## Git

- `git pull` before work; commit after steps 4, 5 and 6 so the history shows at least three spec-file commits per feature.
- Use the repo's configured identity. Commit messages describe the change only: no mention of an AI tool, no `Co-Authored-By` line.
- Commit `reports/` after the final run of a feature.

## EShop facts (environment control and locators only, never verdicts)

- Backend `http://localhost:3000`, web `http://localhost:5173`, admin `http://localhost:5174`. Admin `admin@eshop.com / Admin123!`, user `test@eshop.com / Test1234!`.
- Restarting the backend re-creates the seed database: users id 1–2, categories 1–3, products 1–5, coupons 1–4.
- The web cart is kept in memory: `page.goto` or a reload empties it. Move between pages with header links after the first `goto`.
- Web login token: `localStorage["token"]`; admin token: `localStorage["adminToken"]`.
- Inputs have no `id` or `name` and labels are not linked to inputs.
- Many results are shown with `alert()`.
- Empty `required` fields are stopped by the browser with its own bubble, whose text differs per browser.
- Cleanup endpoints (admin token in `Authorization: Bearer`): `DELETE /api/admin/users/:id`, `DELETE /api/admin/coupons/:id`, `DELETE /api/categories/:id`, `DELETE /api/products/:id`. Orders and coupon usage cannot be deleted: restart the backend instead.
- Shared helpers are in `helpers/common.js`; add feature cleanup or navigation helpers there, keep assertions in the spec file.

## Maintaining an existing feature

When a script breaks after a UI change or a new case is requested: add or edit the row in the data file first, change the script only if a new `expected` type or locator is needed, rerun all three browsers, and record the change in the audit log. A locator change needs step 2's justification again.

## Done checklist for a feature

- [ ] 12 or more automated cases, IDs identical in data file, test titles and report
- [ ] data in `data/FR-xx.json`, no inline case arrays
- [ ] 3 or more assertion patterns, listed in the spec header and the report
- [ ] 3 HTML reports with "Run by" and ISO timestamp
- [ ] every red test classified; SUT defects in `report/bugs.md` and GitHub Issues with screenshot
- [ ] review table with real AI mistakes and their causes
- [ ] cases not automated listed with reasons
- [ ] 3 or more commits touching the spec file
- [ ] audit rows for every step
