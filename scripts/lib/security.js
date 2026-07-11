const path = require('path');

const SKILL_NAME_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const GITHUB_REPO_REGEX = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

function validateSkillName(name) {
  if (typeof name !== 'string' || !SKILL_NAME_REGEX.test(name)) {
    throw new Error(`Invalid skill name: "${name}"`);
  }
  return name;
}

function resolveInside(baseDir, name) {
  validateSkillName(name);
  const base = path.resolve(baseDir);
  const resolved = path.resolve(base, name);
  if (path.dirname(resolved) !== base) {
    throw new Error(`Path escapes skills directory: "${name}"`);
  }
  return resolved;
}

function validateGithubRepo(repo) {
  if (typeof repo !== 'string' || !GITHUB_REPO_REGEX.test(repo)) {
    throw new Error(`Invalid GitHub repository: "${repo}"`);
  }
  return repo;
}

function validateHttpUrl(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Invalid URL: "${value}"`);
  }
  if (!['https:', 'http:'].includes(parsed.protocol)) {
    throw new Error(`Unsupported URL protocol: "${parsed.protocol}"`);
  }
  return parsed.toString();
}

module.exports = {
  SKILL_NAME_REGEX,
  resolveInside,
  validateGithubRepo,
  validateHttpUrl,
  validateSkillName,
};
