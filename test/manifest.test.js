const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { readManifest } = require('../scripts/lib/manifest');

test('readManifest uses a default only when the file is missing', () => {
  const missing = path.join(os.tmpdir(), `missing-manifest-${process.pid}.json`);
  assert.deepEqual(readManifest(missing, () => ({ version: 1 })), { version: 1 });
});

test('readManifest rejects malformed JSON instead of replacing it', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fe-skills-manifest-'));
  try {
    const manifest = path.join(root, 'manifest.json');
    fs.writeFileSync(manifest, '{ invalid');
    assert.throws(() => readManifest(manifest, () => ({})), /Cannot read manifest/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
