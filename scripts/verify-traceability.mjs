import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const SPECS_DIR = join(ROOT, 'specs');
const TESTS_ROOT = join(ROOT, 'tests');

const CA_ID_RE = /CA-[A-Z]+-\d+/g;
// Criteria actually OWNED by a spec.md/tasks.md are the first cell of a markdown table row
// (`| CA-X-NN | ...`). A bare CA-ID.g. mentioned in prose (a cross-reference to another
// feature's criterion, or a note pointing at a sibling ID within the same file) must not count
// as if that file were defining it — this table-row anchor is what tells the two apart.
const CA_ID_ROW_RE = /^\|\s*(CA-[A-Z]+-\d+)\s*\|/gm;
const FEATURE_DIR_RE = /^\d+-(.+)$/;

function extractIds(text) {
  return new Set(text.match(CA_ID_RE) || []);
}

function extractOwnedIds(text) {
  const ids = new Set();
  for (const match of text.matchAll(CA_ID_ROW_RE)) ids.add(match[1]);
  return ids;
}

function collectTestFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTestFiles(full));
    } else if (entry.name.endsWith('.test.js')) {
      files.push(full);
    }
  }
  return files;
}

function sortIds(ids) {
  return [...ids].sort((a, b) => {
    const [, areaA, numA] = a.match(/^CA-([A-Z]+)-(\d+)$/);
    const [, areaB, numB] = b.match(/^CA-([A-Z]+)-(\d+)$/);
    if (areaA !== areaB) return areaA.localeCompare(areaB);
    return parseInt(numA, 10) - parseInt(numB, 10);
  });
}

// 1. Discover features: any specs/<NNN-name>/ directory that has both spec.md and tasks.md.
//    A feature with only spec.md (no tasks.md yet) hasn't reached /speckit-implement and is
//    skipped rather than treated as an error — it has no code or tests to trace yet.
if (!existsSync(SPECS_DIR)) {
  console.error(`FAIL: specs directory not found at ${SPECS_DIR}`);
  process.exit(1);
}

const featureDirs = readdirSync(SPECS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && FEATURE_DIR_RE.test(entry.name))
  .map((entry) => entry.name)
  .sort();

// 2. COMMIT_IDS — only subjects following the task/RED naming convention
//    (T-NNN: ... or test(...): ...) count as implementation evidence;
//    docs:/chore:/etc. subjects are excluded even if they mention a CA-ID. Commit history is
//    shared across features, so this is computed once, globally.
const TASK_COMMIT_RE = /^(T-\d+:|test\(.+\):)/;
let log = '';
try {
  log = execSync('git log --pretty=format:%s', { cwd: ROOT, encoding: 'utf8' });
} catch {
  log = '';
}
const commitSubjects = log.split('\n').filter((subject) => TASK_COMMIT_RE.test(subject));
const COMMIT_IDS = extractIds(commitSubjects.join('\n'));

// 3. Per-feature scan and report — each feature's spec.md, tasks.md, and tests/<area> are
//    checked independently so an orphan report shows which feature it belongs to, not just a
//    single merged CA-ID list.
let exitCode = 0;
let totalTraced = 0;
let featuresChecked = 0;

for (const featureDir of featureDirs) {
  const specPath = join(SPECS_DIR, featureDir, 'spec.md');
  const tasksPath = join(SPECS_DIR, featureDir, 'tasks.md');
  if (!existsSync(specPath) || !existsSync(tasksPath)) continue;

  const [, area] = featureDir.match(FEATURE_DIR_RE);
  const testsDir = join(TESTS_ROOT, area);
  if (!existsSync(testsDir)) {
    console.error(`FAIL: tests directory not found at ${testsDir} (required by ${featureDir})`);
    process.exit(1);
  }

  const specIds = extractOwnedIds(readFileSync(specPath, 'utf8'));
  const tasksIds = extractOwnedIds(readFileSync(tasksPath, 'utf8'));
  const testText = collectTestFiles(testsDir)
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');
  const testIds = extractIds(testText);

  featuresChecked += 1;
  console.log(`\n${featureDir}:`);
  let featureOrphans = 0;

  for (const id of sortIds(specIds)) {
    const orphanedIn = [];
    if (!tasksIds.has(id)) orphanedIn.push('tasks.md');
    if (!testIds.has(id)) orphanedIn.push('tests');
    if (!COMMIT_IDS.has(id)) orphanedIn.push('git log');
    if (orphanedIn.length > 0) {
      console.log(`  ORPHAN: ${id} missing in: ${orphanedIn.join(', ')}`);
      featureOrphans += 1;
      exitCode = 1;
    }
  }

  if (featureOrphans === 0) {
    console.log(`  OK: all ${specIds.size} CA-IDs fully traced`);
  }
  totalTraced += specIds.size;
}

// 4. Result
console.log('');
if (exitCode === 0) {
  console.log(`OK: all ${totalTraced} CA-IDs fully traced across ${featuresChecked} feature(s)`);
}

process.exit(exitCode);
