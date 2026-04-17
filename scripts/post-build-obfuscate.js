#!/usr/bin/env node
// post-build-obfuscate.js
// Runs after electron-builder packages the app.
// Unpacks the ASAR, obfuscates all JS, repacks.
// Source files on disk are never touched — only the packaged build.

const path = require('path');
const fs   = require('fs');
const asar = require('@electron/asar');
const JavaScriptObfuscator = require('javascript-obfuscator');

const DIST_DIR  = path.join(__dirname, '..', 'dist');
const ASAR_PATH = path.join(DIST_DIR, 'win-unpacked', 'resources', 'app.asar');
const TEMP_DIR  = path.join(DIST_DIR, '_obf-temp');

if (!fs.existsSync(ASAR_PATH)) {
  console.error('[obfuscate] ASAR not found at:', ASAR_PATH);
  process.exit(1);
}

// ── Options for CommonJS files (main.js, preload.js) ─────────────────────────
const COMMONJS_OPTIONS = {
  compact:                    true,
  controlFlowFlattening:      false,  // risky in Electron main process
  deadCodeInjection:          false,
  debugProtection:            false,  // don't break DevTools for staff
  identifierNamesGenerator:   'hexadecimal',
  renameGlobals:              false,  // would break window.xxx patterns
  rotateStringArray:          true,
  selfDefending:              false,  // causes issues in Electron
  stringArray:                true,
  stringArrayEncoding:        ['base64'],
  stringArrayThreshold:       0.8,
  sourceType:                 'script',
};

// ── Options for ES module files (js/**) ──────────────────────────────────────
// More conservative — string array disabled to avoid encoding import paths
const MODULE_OPTIONS = {
  compact:                    true,
  controlFlowFlattening:      false,
  deadCodeInjection:          false,
  debugProtection:            false,
  identifierNamesGenerator:   'hexadecimal',
  renameGlobals:              false,
  rotateStringArray:          false,
  selfDefending:              false,
  stringArray:                false,  // disabled — import paths must stay as literals
  sourceType:                 'module',
};

let total = 0;
let failed = 0;

function obfuscateFile(filePath, options) {
  try {
    const src    = fs.readFileSync(filePath, 'utf8');
    const result = JavaScriptObfuscator.obfuscate(src, options);
    fs.writeFileSync(filePath, result.getObfuscatedCode(), 'utf8');
    console.log('  [ok]', path.relative(TEMP_DIR, filePath));
    total++;
  } catch(e) {
    console.error('  [FAIL]', path.relative(TEMP_DIR, filePath), '-', e.message);
    failed++;
  }
}

function walkDir(dir, options) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      walkDir(full, options);
    } else if (entry.endsWith('.js')) {
      obfuscateFile(full, options);
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log('[obfuscate] Unpacking ASAR...');
if (fs.existsSync(TEMP_DIR)) fs.rmSync(TEMP_DIR, { recursive: true, force: true });
asar.extractAll(ASAR_PATH, TEMP_DIR);

console.log('[obfuscate] Obfuscating...');
obfuscateFile(path.join(TEMP_DIR, 'main.js'),    COMMONJS_OPTIONS);
obfuscateFile(path.join(TEMP_DIR, 'preload.js'), COMMONJS_OPTIONS);
walkDir(path.join(TEMP_DIR, 'js'), MODULE_OPTIONS);

if (failed > 0) {
  console.error(`[obfuscate] ${failed} file(s) failed — aborting repack.`);
  process.exit(1);
}

console.log(`[obfuscate] Repacking ASAR (${total} files obfuscated)...`);
fs.unlinkSync(ASAR_PATH);
asar.createPackage(TEMP_DIR, ASAR_PATH).then(() => {
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  console.log('[obfuscate] Done.');
}).catch(e => {
  console.error('[obfuscate] Repack failed:', e.message);
  process.exit(1);
});
