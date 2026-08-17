const fs = require('fs');
const ts = require('typescript');
const path = require('path');

const tsCode = fs.readFileSync(path.join(__dirname, '../src/server/business-site.ts'), 'utf8');
const transpiled = ts.transpileModule(tsCode, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
});
const m = { exports: {} };
const fn = new Function('module', 'exports', 'require', transpiled.outputText);
fn(m, m.exports, () => ({}));
const html = m.exports.renderBusinessSiteHtml();
console.log('HTML Byte Length:', Buffer.byteLength(html, 'utf8'));
console.log('HTML Char Length:', html.length);
console.log('Includes stageTitle:', html.includes('stageTitle'));
console.log('Includes global-health:', html.includes('global-health'));
console.log('Includes enterprise-roi:', html.includes('enterprise-roi'));
