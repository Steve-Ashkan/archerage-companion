#!/usr/bin/env node
// post-build-obfuscate.js
// Obfuscates JS in the packed ASAR before the NSIS installer is created.
// Invoked as an electron-builder afterPack hook (receives context.appOutDir),
// or run standalone: node scripts/post-build-obfuscate.js

const path = require('path');
const fs   = require('fs');
const asar = require('@electron/asar');
const JavaScriptObfuscator = require('javascript-obfuscator');

// ── Options for CommonJS files (main.js, preload.js) ─────────────────────────
const COMMONJS_OPTIONS = {
  compact:                    true,
  controlFlowFlattening:      false,  // risky in Electron main process
  deadCodeInjection:          false,
  debugProtection:            false,
  identifierNamesGenerator:   'hexadecimal',
  renameGlobals:              false,
  rotateStringArray:          true,
  selfDefending:              false,
  stringArray:                true,
  stringArrayEncoding:        ['base64'],
  stringArrayThreshold:       0.8,
  sourceType:                 'script',
};

// ── Options for ES module files (js/**) ──────────────────────────────────────
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

let total  = 0;
let failed = 0;

function obfuscateFile(filePath, options, tempDir) {
  try {
    const src    = fs.readFileSync(filePath, 'utf8');
    const result = JavaScriptObfuscator.obfuscate(src, options);
    fs.writeFileSync(filePath, result.getObfuscatedCode(), 'utf8');
    console.log('  [ok]', path.relative(tempDir, filePath));
    total++;
  } catch (e) {
    console.error('  [FAIL]', path.relative(tempDir, filePath), '-', e.message);
    failed++;
  }
}

function walkDir(dir, options, tempDir) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      walkDir(full, options, tempDir);
    } else if (entry.endsWith('.js')) {
      obfuscateFile(full, options, tempDir);
    }
  }
}

async function run(appOutDir) {
  const ASAR_PATH = path.join(appOutDir, 'resources', 'app.asar');
  const TEMP_DIR  = path.join(appOutDir, '..', '_obf-temp');

  if (!fs.existsSync(ASAR_PATH)) {
    console.error('[obfuscate] ASAR not found at:', ASAR_PATH);
    process.exit(1);
  }

  total  = 0;
  failed = 0;

  console.log('[obfuscate] Unpacking ASAR...');
  if (fs.existsSync(TEMP_DIR)) fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  asar.extractAll(ASAR_PATH, TEMP_DIR);

  console.log('[obfuscate] Obfuscating...');
  obfuscateFile(path.join(TEMP_DIR, 'main.js'),    COMMONJS_OPTIONS, TEMP_DIR);
  obfuscateFile(path.join(TEMP_DIR, 'preload.js'), COMMONJS_OPTIONS, TEMP_DIR);
  walkDir(path.join(TEMP_DIR, 'js'), MODULE_OPTIONS, TEMP_DIR);

  if (failed > 0) {
    console.error(`[obfuscate] ${failed} file(s) failed — aborting repack.`);
    process.exit(1);
  }

  console.log(`[obfuscate] Repacking ASAR (${total} files obfuscated)...`);
  fs.unlinkSync(ASAR_PATH);
  await asar.createPackage(TEMP_DIR, ASAR_PATH);
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  console.log('[obfuscate] Done.');
}

// Called as electron-builder afterPack hook
module.exports = async function(context) {
  await run(context.appOutDir);
};

// Called standalone: node scripts/post-build-obfuscate.js
if (require.main === module) {
  const appOutDir = path.join(__dirname, '..', 'dist', 'win-unpacked');
  run(appOutDir).catch(e => {
    console.error('[obfuscate] Fatal:', e.message);
    process.exit(1);
  });
}
