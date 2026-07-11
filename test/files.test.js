const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { replaceDirectory } = require('../scripts/lib/files');

test('replaceDirectory removes stale files and adds generated metadata', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fe-skills-replace-'));
  try {
    const source = path.join(root, 'source');
    const target = path.join(root, 'target');
    fs.mkdirSync(source);
    fs.mkdirSync(target);
    fs.writeFileSync(path.join(source, 'SKILL.md'), 'new');
    fs.writeFileSync(path.join(target, 'SKILL.md'), 'old');
    fs.writeFileSync(path.join(target, 'stale.md'), 'stale');

    replaceDirectory(source, target, {
      prepare: stagingDir => fs.writeFileSync(path.join(stagingDir, 'GENERATION.md'), 'generated'),
    });

    assert.equal(fs.readFileSync(path.join(target, 'SKILL.md'), 'utf8'), 'new');
    assert.equal(fs.readFileSync(path.join(target, 'GENERATION.md'), 'utf8'), 'generated');
    assert.equal(fs.existsSync(path.join(target, 'stale.md')), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('replaceDirectory keeps the previous target when source validation fails', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fe-skills-replace-'));
  try {
    const source = path.join(root, 'source');
    const target = path.join(root, 'target');
    fs.mkdirSync(source);
    fs.mkdirSync(target);
    fs.writeFileSync(path.join(target, 'SKILL.md'), 'old');

    assert.throws(() => replaceDirectory(source, target), /does not contain SKILL.md/);
    assert.equal(fs.readFileSync(path.join(target, 'SKILL.md'), 'utf8'), 'old');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
