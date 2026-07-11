const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');

const {
  resolveInside,
  validateGithubRepo,
  validateHttpUrl,
  validateSkillName,
} = require('../scripts/lib/security');

test('accepts valid skill names and resolves them inside the skills directory', () => {
  const base = path.resolve('/tmp/example-skills');
  assert.equal(validateSkillName('fe-code-review'), 'fe-code-review');
  assert.equal(resolveInside(base, 'fe-code-review'), path.join(base, 'fe-code-review'));
});

test('rejects path traversal and malformed skill names', () => {
  for (const name of ['../outside', '/tmp/outside', 'Uppercase', 'two--hyphens', '']) {
    assert.throws(() => resolveInside('/tmp/example-skills', name), /Invalid skill name/);
  }
});

test('rejects shell syntax in GitHub repositories', () => {
  assert.equal(validateGithubRepo('owner/repo.js'), 'owner/repo.js');
  assert.throws(() => validateGithubRepo('owner/repo;touch-pwned'), /Invalid GitHub repository/);
  assert.throws(() => validateGithubRepo('owner/repo extra'), /Invalid GitHub repository/);
});

test('accepts HTTP URLs and rejects other protocols', () => {
  assert.equal(validateHttpUrl('https://example.com/a.md'), 'https://example.com/a.md');
  assert.throws(() => validateHttpUrl('file:///tmp/a.md'), /Unsupported URL protocol/);
});
