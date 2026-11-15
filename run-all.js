// Runs every feature on every browser: 3 x 3 = 9 runs, one HTML report each in reports/<feature>-<browser>/.
// Usage:  node run-all.js            -> all 9 runs
//         node run-all.js FR-01      -> one feature on 3 browsers
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FEATURES = ['FR-01', 'FR-07', 'FR-17'];
const BROWSERS = ['chromium', 'firefox', 'webkit'];

const only = process.argv[2];
const features = only ? FEATURES.filter((f) => f === only) : FEATURES;
if (features.length === 0) {
  console.error(`Unknown feature "${only}". Use one of: ${FEATURES.join(', ')}`);
  process.exit(1);
}

const summary = [];
for (const feature of features) {
  const spec = `tests/${feature}.spec.js`;
  if (!fs.existsSync(path.join(__dirname, spec))) {
    console.log(`\n[skip] ${spec} does not exist yet`);
    continue;
  }
  for (const browser of BROWSERS) {
    console.log(`\n===== ${feature} on ${browser} =====`);
    const r = spawnSync('npx', ['playwright', 'test', spec, `--project=${browser}`], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, FEATURE: feature, BROWSER: browser },
    });
    summary.push({ feature, browser, exitCode: r.status, report: `reports/${feature}-${browser}/index.html` });
  }
}

console.log('\n===== Summary (exit code 1 = at least one failing test) =====');
console.table(summary);
