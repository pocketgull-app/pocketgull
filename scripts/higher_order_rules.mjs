// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 PocketGull LLC & Phillip Gear
/**
 * Shared Higher-Order Static Predicates
 * Single source of truth consumed by both `agy_pre_tool_guard.mjs` (PreToolUse)
 * and `universal_observatory_csprng_audit.mjs` (static repo verifier).
 */

export const PRIVATE_KEY_RE = /-----BEGIN\s+(?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/;
export const BANNED_FOUNDRY_PATH_RE = /(?:pg2[\\/]+pocketgull|scratch[\\/]+fonts[\\/]+ofl[\\/]+pocketgull)/i;
export const ADOBE_PRERELEASE_RE =
  /(?:Adobe\s+(?:Illustrator|InDesign|Photoshop|Premiere|After Effects|Acrobat)[^\r\n"'`]*\((?:Prerelease|Beta)\)|Adobe_Insiders_Standard_PRA\.pdf|Adobe_Confidentiality_Agreement_Signed\.pdf)/i;
export const CONFIDENTIAL_AGREEMENT_FILE_RE =
  /(?:Confidentiality Agreement\.pdf|Adobe_Insiders_Standard_PRA\.pdf|Adobe_Confidentiality_Agreement_Signed\.pdf)/i;
export const SECURITY_CRITICAL_PATH_RE =
  /(?:^|[\\/])src[\\/](?:server|guards|fhir|privacy|security)[\\/]|(?:security|auth|privacy|de-identification|crypto|token|csprng|fhir|guard|server)\.[^.]+$/i;

export function stripJsComments(source) {
  return String(source || '')
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\r\n]/g, ' '))
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/**
 * Checks whether production script-src CSP strings allow `'unsafe-inline'` or `'unsafe-eval'`.
 * Safely handles multi-line `isProd ? ... : ...` ternaries (ignoring the dev else-branch)
 * and permits `'unsafe-inline'` when restricted to `style-src`.
 */
export function hasProdUnsafeScriptCsp(content) {
  const code = stripJsComments(content);

  // Inspect multi-line `scriptSrc = isProd ? <prodExpr> : <devExpr>;` assignments accurately
  const ternaryRe = /scriptSrc\s*=\s*isProd\s*\?\s*([^;:]+?)\s*:\s*[^;]+;/gs;
  let match;
  let sawScriptSrcTernary = false;
  while ((match = ternaryRe.exec(code)) !== null) {
    sawScriptSrcTernary = true;
    const prodExpr = match[1];
    if (/(?:'unsafe-inline'|'unsafe-eval')/i.test(prodExpr)) {
      return true;
    }
  }
  if (sawScriptSrcTernary) {
    return false;
  }

  // Fallback per-line inspect for static headers (firebase.json, vercel.json, single-line CSP literals)
  const lines = code.split(/\r?\n/);
  for (const line of lines) {
    if (!/(?:'unsafe-inline'|'unsafe-eval')/i.test(line)) continue;
    if (/\bstyle-?src\b/i.test(line) && !/\bscript-?src\b/i.test(line)) continue;
    if (/development|!\s*isProd/i.test(line)) continue;
    if (/\bscript-?src\b|Content-Security-Policy/i.test(line)) {
      return true;
    }
  }
  return false;
}

export function hasUncommentedMathRandom(source) {
  return /\bMath\.random\s*\(/.test(stripJsComments(source));
}
