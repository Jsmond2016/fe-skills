const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const SYNC_SCRIPT = path.resolve(__dirname, '../skills/sync-agent-skills/scripts/sync.cjs');

test('sync preserves unmanaged entries and removes only stale links owned by the source', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fe-skills-sync-'));
  try {
    const source = path.join(root, '.agents', 'skills');
    const target = path.join(root, '.claude', 'skills');
    const external = path.join(root, 'external-skill');
    fs.mkdirSync(path.join(source, 'active-skill'), { recursive: true });
    fs.writeFileSync(path.join(source, 'active-skill', 'SKILL.md'), '---\nname: active-skill\ndescription: active\n---\n');
    fs.mkdirSync(path.join(source, 'stale-skill'), { recursive: true });
    fs.mkdirSync(path.join(target, 'personal-skill'), { recursive: true });
    fs.mkdirSync(external, { recursive: true });
    fs.symlinkSync(path.relative(target, external), path.join(target, 'external-skill'), 'dir');
    fs.symlinkSync(path.relative(target, path.join(source, 'stale-skill')), path.join(target, 'stale-skill'), 'dir');
    fs.rmSync(path.join(source, 'stale-skill'), { recursive: true });

    execFileSync(process.execPath, [SYNC_SCRIPT, '--source', source, '--platform', 'claude']);

    assert.equal(fs.existsSync(path.join(target, 'active-skill')), true);
    assert.equal(fs.existsSync(path.join(target, 'personal-skill')), true);
    assert.equal(fs.lstatSync(path.join(target, 'external-skill')).isSymbolicLink(), true);
    assert.throws(() => fs.lstatSync(path.join(target, 'stale-skill')), { code: 'ENOENT' });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('sync defaults to claude only and leaves codex directory absent', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fe-skills-sync-default-'));
  try {
    const source = path.join(root, '.agents', 'skills');
    fs.mkdirSync(path.join(source, 'active-skill'), { recursive: true });
    fs.writeFileSync(path.join(source, 'active-skill', 'SKILL.md'), '---\nname: active-skill\ndescription: active\n---\n');

    execFileSync(process.execPath, [SYNC_SCRIPT, '--source', source]);

    assert.equal(fs.existsSync(path.join(root, '.claude', 'skills', 'active-skill')), true);
    assert.equal(fs.existsSync(path.join(root, '.codex')), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('sync can explicitly create legacy codex links', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'fe-skills-sync-codex-'));
  try {
    const source = path.join(root, '.agents', 'skills');
    fs.mkdirSync(path.join(source, 'active-skill'), { recursive: true });
    fs.writeFileSync(path.join(source, 'active-skill', 'SKILL.md'), '---\nname: active-skill\ndescription: active\n---\n');

    execFileSync(process.execPath, [SYNC_SCRIPT, '--source', source, '--platform', 'codex']);

    const linkPath = path.join(root, '.codex', 'skills', 'active-skill');
    assert.equal(fs.lstatSync(linkPath).isSymbolicLink(), true);
    assert.equal(fs.existsSync(path.join(root, '.claude')), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
