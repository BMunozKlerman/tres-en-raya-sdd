import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const SPEC_PATH = join(ROOT, 'specs/001-engine/spec.md');
const TASKS_PATH = join(ROOT, 'specs/001-engine/tasks.md');
const TESTS_DIR = join(ROOT, 'tests/engine');

const CA_ID_RE = /CA-M-\d+/g;

function extractIds(text) {
  return new Set(text.match(CA_ID_RE) || []);
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
    const na = parseInt(a.match(/\d+/)[0], 10);
    const nb = parseInt(b.match(/\d+/)[0], 10);
    return na - nb;
  });
}

// 1. SPEC_IDS
if (!existsSync(SPEC_PATH)) {
  console.error(`FAIL: spec file not found at ${SPEC_PATH}`);
  process.exit(1);
}
const SPEC_IDS = extractIds(readFileSync(SPEC_PATH, 'utf8'));

// 2. TASKS_IDS
if (!existsSync(TASKS_PATH)) {
  console.error(`FAIL: tasks.md not found at ${TASKS_PATH}`);
  process.exit(1);
}
const TASKS_IDS = extractIds(readFileSync(TASKS_PATH, 'utf8'));

// 3. TEST_IDS
if (!existsSync(TESTS_DIR)) {
  console.error(`FAIL: tests directory not found at ${TESTS_DIR}`);
  process.exit(1);
}
const testText = collectTestFiles(TESTS_DIR)
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');
const TEST_IDS = extractIds(testText);

// 4. COMMIT_IDS — only subjects following the task/RED naming convention
//    (T-NNN: ... or test(...): ...) count as implementation evidence;
//    docs:/chore:/etc. subjects are excluded even if they mention a CA-ID.
const TASK_COMMIT_RE = /^(T-\d+:|test\(.+\):)/;
let log = '';
try {
  log = execSync('git log --pretty=format:%s', { cwd: ROOT, encoding: 'utf8' });
} catch {
  log = '';
}
const commitSubjects = log.split('\n').filter((subject) => TASK_COMMIT_RE.test(subject));
const COMMIT_IDS = extractIds(commitSubjects.join('\n'));

// 5. Orphan scan
let exitCode = 0;
for (const id of sortIds(SPEC_IDS)) {
  const orphanedIn = [];
  if (!TASKS_IDS.has(id)) orphanedIn.push('tasks.md');
  if (!TEST_IDS.has(id)) orphanedIn.push('tests');
  if (!COMMIT_IDS.has(id)) orphanedIn.push('git log');
  if (orphanedIn.length > 0) {
    console.log(`ORPHAN: ${id} missing in: ${orphanedIn.join(', ')}`);
    exitCode = 1;
  }
}

// 6. Result
if (exitCode === 0) {
  console.log(`OK: all ${SPEC_IDS.size} CA-IDs fully traced`);
}

process.exit(exitCode);
