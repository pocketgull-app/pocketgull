/**
 * Auto-Tagger — Creates git tags from Conventional Commit messages.
 * Invoked by the husky `post-commit` hook after every successful commit.
 *
 * Version bump rules:
 *   - feat     → minor bump  (1.0.0-rc7  → 1.1.0-rc1)
 *   - fix      → patch bump  (1.0.0-rc7  → 1.0.1-rc1)
 *   - BREAKING → major bump  (1.0.0-rc7  → 2.0.0-rc1)
 *   - Other types (chore, docs, refactor, etc.) → RC increment (1.0.0-rc7 → 1.0.0-rc8)
 *
 * When the version has no prerelease suffix (e.g. 1.0.0), bumps go to:
 *   - feat     → 1.1.0
 *   - fix      → 1.0.1
 *   - BREAKING → 2.0.0
 *   - Other    → no tag (non-functional changes don't warrant a release tag)
 *
 * Environment variable overrides:
 *   - SKIP_AUTOTAG=1  — Skip auto-tagging entirely
 *   - AUTOTAG_DRY=1   — Print what would be tagged without creating the tag
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Allow opting out
if (process.env.SKIP_AUTOTAG === '1') {
  process.exit(0);
}

const DRY_RUN = process.env.AUTOTAG_DRY === '1';

// Resolve workspace root
function getWorkspaceRoot() {
  let root = path.resolve(__dirname, '..');
  if (root.match(/^[a-z]:/)) {
    root = root[0].toUpperCase() + root.slice(1);
  }
  return root;
}

const workspaceRoot = getWorkspaceRoot();

/**
 * Read the current version from package.json.
 */
function getCurrentVersion() {
  const pkgPath = path.join(workspaceRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return pkg.version;
}

/**
 * Parse a SemVer string (with optional prerelease).
 * Examples: "1.0.0-rc7" → { major:1, minor:0, patch:0, pre:"rc", preNum:7 }
 *           "2.1.3"     → { major:2, minor:1, patch:3, pre:null, preNum:null }
 */
function parseSemVer(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z]+)(\d+))?$/);
  if (!match) {
    return null;
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    pre: match[4] || null,
    preNum: match[5] ? parseInt(match[5], 10) : null,
  };
}

/**
 * Format a parsed version back to a string.
 */
function formatVersion(v) {
  const base = `${v.major}.${v.minor}.${v.patch}`;
  if (v.pre && v.preNum !== null) {
    return `${base}-${v.pre}${v.preNum}`;
  }
  return base;
}

/**
 * Get the latest commit message (subject line only).
 */
function getLatestCommitMessage() {
  try {
    return execSync('git log -1 --pretty=%s', {
      encoding: 'utf8',
      cwd: workspaceRoot,
    }).trim();
  } catch {
    return null;
  }
}

/**
 * Get the full commit message body to check for BREAKING CHANGE.
 */
function getLatestCommitBody() {
  try {
    return execSync('git log -1 --pretty=%b', {
      encoding: 'utf8',
      cwd: workspaceRoot,
    }).trim();
  } catch {
    return '';
  }
}

/**
 * Check if a tag already exists.
 */
function tagExists(tag) {
  try {
    execSync(`git rev-parse "refs/tags/${tag}"`, {
      encoding: 'utf8',
      cwd: workspaceRoot,
      stdio: 'pipe',
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Determine bump type from a conventional commit message.
 * Returns: 'major' | 'minor' | 'patch' | 'prerelease' | null
 */
function determineBumpType(subject, body) {
  // Check for breaking change
  if (subject.includes('!:') || body.startsWith('BREAKING CHANGE:')) {
    return 'major';
  }

  // Parse the type from conventional commit
  const typeMatch = subject.match(/^(\w+)\(/);
  if (!typeMatch) {
    return null; // Not a conventional commit, skip
  }

  const type = typeMatch[1];

  switch (type) {
    case 'feat':
      return 'minor';
    case 'fix':
    case 'security':
      return 'patch';
    case 'perf':
      return 'patch';
    case 'chore':
    case 'docs':
    case 'test':
    case 'refactor':
    case 'style':
    case 'ci':
    case 'build':
      return 'prerelease';
    default:
      return 'prerelease';
  }
}

/**
 * Compute the next version based on bump type.
 */
function bumpVersion(current, bumpType) {
  const v = { ...current };

  if (v.pre) {
    // Currently in prerelease (e.g. rc)
    switch (bumpType) {
      case 'major':
        v.major += 1;
        v.minor = 0;
        v.patch = 0;
        v.preNum = 1;
        break;
      case 'minor':
        v.minor += 1;
        v.patch = 0;
        v.preNum = 1;
        break;
      case 'patch':
        v.patch += 1;
        v.preNum = 1;
        break;
      case 'prerelease':
        v.preNum += 1;
        break;
    }
  } else {
    // Stable release — non-functional changes don't get tags
    switch (bumpType) {
      case 'major':
        v.major += 1;
        v.minor = 0;
        v.patch = 0;
        break;
      case 'minor':
        v.minor += 1;
        v.patch = 0;
        break;
      case 'patch':
        v.patch += 1;
        break;
      case 'prerelease':
        return null; // No tag for non-functional changes on stable
    }
  }

  return v;
}

// ── Main ──

const subject = getLatestCommitMessage();
if (!subject) {
  process.exit(0);
}

const body = getLatestCommitBody();
const bumpType = determineBumpType(subject, body);

if (!bumpType) {
  // Not a conventional commit — skip silently
  process.exit(0);
}

const currentVersionStr = getCurrentVersion();
const currentVersion = parseSemVer(currentVersionStr);

if (!currentVersion) {
  console.error(`⚠️  auto-tag: Cannot parse version "${currentVersionStr}" — skipping`);
  process.exit(0);
}

const nextVersion = bumpVersion(currentVersion, bumpType);

if (!nextVersion) {
  // No tag needed (e.g. chore on stable)
  process.exit(0);
}

const nextVersionStr = formatVersion(nextVersion);
const tagName = `v${nextVersionStr}`;

if (tagExists(tagName)) {
  console.log(`🏷️  auto-tag: Tag ${tagName} already exists — skipping`);
  process.exit(0);
}

if (DRY_RUN) {
  console.log(`🏷️  auto-tag [DRY RUN]: Would create tag ${tagName} (${bumpType} bump from v${currentVersionStr})`);
  console.log(`   Commit: ${subject}`);
  process.exit(0);
}

try {
  execSync(`git tag -a "${tagName}" -m "${subject}"`, {
    cwd: workspaceRoot,
    stdio: 'pipe',
  });
  console.log(`🏷️  auto-tag: Created ${tagName} (${bumpType} bump from v${currentVersionStr})`);
} catch (err) {
  console.error(`⚠️  auto-tag: Failed to create tag — ${err.message}`);
}
