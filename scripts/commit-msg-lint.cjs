/**
 * Commit Message Linter — Validates Conventional Commits format.
 * Invoked by the husky `commit-msg` hook.
 *
 * Format: <type>(<scope>): <description>
 *
 * Exits 0 on valid, 1 on invalid (blocks the commit).
 */

const fs = require('fs');
const path = require('path');

const COMMIT_MSG_FILE = process.argv[2] || path.resolve('.git', 'COMMIT_EDITMSG');

if (!fs.existsSync(COMMIT_MSG_FILE)) {
  console.error('❌ commit-msg hook: Cannot find commit message file.');
  process.exit(1);
}

const rawMessage = fs.readFileSync(COMMIT_MSG_FILE, 'utf8').trim();

// Strip comment lines (git's default # lines) and leading/trailing whitespace
const lines = rawMessage.split('\n').filter(line => !line.startsWith('#'));
const message = lines.join('\n').trim();

if (!message) {
  console.error('❌ Commit message is empty.');
  process.exit(1);
}

const subject = lines[0].trim();

// Allowed types
const TYPES = [
  'feat', 'fix', 'docs', 'test', 'security',
  'chore', 'refactor', 'perf', 'style', 'ci', 'build'
];

// Conventional Commits regex: type(scope): description
// - type: one of the allowed types
// - scope: required, lowercase with hyphens/digits allowed
// - description: starts lowercase, no period at end
const PATTERN = /^(\w+)\(([a-z0-9][a-z0-9\-/]*)\):\s+(.+)$/;

const match = subject.match(PATTERN);

if (!match) {
  console.error('');
  console.error('❌ Commit message does not match Conventional Commits format.');
  console.error('');
  console.error('   Expected: <type>(<scope>): <description>');
  console.error(`   Received: "${subject}"`);
  console.error('');
  console.error('   Types:  ' + TYPES.join(', '));
  console.error('   Scopes: ui, ai, clinical, server, flutter, python, security, ci, demo, e2e, three, sentinel, types, build, deps, ...');
  console.error('');
  console.error('   Examples:');
  console.error('     feat(ai): add Gemini 2.5 Flash streaming to voice assistant');
  console.error('     fix(clinical): sync intake form keys with care plan report');
  console.error('     chore(deps): bump Angular to v22.1');
  console.error('');
  process.exit(1);
}

const [, type, scope, description] = match;

// Validate type
if (!TYPES.includes(type)) {
  console.error('');
  console.error(`❌ Invalid commit type: "${type}"`);
  console.error(`   Allowed types: ${TYPES.join(', ')}`);
  console.error('');
  process.exit(1);
}

// Validate description starts lowercase
if (/^[A-Z]/.test(description)) {
  console.error('');
  console.error(`❌ Commit description must start with a lowercase letter.`);
  console.error(`   Received: "${description}"`);
  console.error('   Tip: Use imperative mood — "add feature" not "Add feature"');
  console.error('');
  process.exit(1);
}

// Validate no trailing period
if (description.endsWith('.')) {
  console.error('');
  console.error('❌ Commit description must not end with a period.');
  console.error(`   Received: "${description}"`);
  console.error('');
  process.exit(1);
}

// Validate subject length
if (subject.length > 72) {
  console.error('');
  console.error(`❌ Commit subject is ${subject.length} characters (max 72).`);
  console.error(`   Subject: "${subject}"`);
  console.error('   Tip: Move details to the commit body after a blank line.');
  console.error('');
  process.exit(1);
}

// Validate body formatting (if present)
if (lines.length > 1) {
  if (lines[1].trim() !== '') {
    console.error('');
    console.error('❌ There must be a blank line between the subject and body.');
    console.error(`   Line 2: "${lines[1]}"`);
    console.error('');
    process.exit(1);
  }
}

console.log(`✅ Commit message valid: ${type}(${scope}): ${description}`);
process.exit(0);
