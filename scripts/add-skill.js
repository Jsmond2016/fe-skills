#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync, execSync } = require('child_process');
const {
  resolveInside,
  validateGithubRepo,
  validateHttpUrl,
  validateSkillName,
} = require('./lib/security');
const { replaceDirectory } = require('./lib/files');
const { readManifest: readManifestFile } = require('./lib/manifest');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const MANIFEST_PATH = path.join(ROOT, 'skill-dependencies.json');
const TEMP_PREFIX = '.sync-tmp-';

// ── Help ──

function showHelp() {
  console.log(`
Usage:
  npm run add-skill <org/repo>[@<skill>]     Install from GitHub repo
  npm run add-skill <url>                     Install from any markdown URL
  npm run add-skill <url> --name <name>       Install from URL with custom name

Examples:
  npm run add-skill antfu/skills@vue          Install a specific skill from a repo
  npm run add-skill antfu/skills              Install all skills from a repo
  npm run add-skill chen8254d/antd-skills     Install a single-skill repo
  npm run add-skill https://raw.githubusercontent.com/.../skill.md  Install from URL
`);
}

// ── Utils ──

function readManifest() {
  return readManifestFile(MANIFEST_PATH, () => ({ version: 2, github: {}, url: {} }));
}

function writeManifest(m) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(m, null, 2) + '\n');
}

function getCommitHash(dir) {
  return execSync('git rev-parse HEAD', { cwd: dir }).toString().trim();
}

function repoName(repo) {
  return repo.split('/')[1] || repo;
}

function isUrl(s) {
  return s.startsWith('http://') || s.startsWith('https://');
}

// ── GitHub blob URL → raw URL ──

function toRawGithubUrl(url) {
  const m = url.match(/^https?:\/\/github\.com\/([^/]+\/[^/]+)\/blob\/(.+)$/);
  return m ? `https://raw.githubusercontent.com/${m[1]}/${m[2]}` : url;
}

// ── Frontmatter handling ──

function parseFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { frontmatter: {}, body: content };
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (kv) fm[kv[1]] = kv[2].trim();
  }
  return { frontmatter: fm, body: m[2].trim() };
}

function stringifyFrontmatter(fm) {
  return '---\n' + Object.entries(fm)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n') + '\n---\n';
}

/**
 * Strip fields that are model-specific (e.g. "model: opus" is Claude-only).
 * Keep generic fields like name, description, version, author, license.
 */
function cleanFrontmatter(fm) {
  const MODEL_SPECIFIC = ['model', 'model_name', 'provider'];
  const clean = { ...fm };
  for (const key of MODEL_SPECIFIC) delete clean[key];
  // Remove metadata object entirely if it exists and is empty
  // (we don't handle nested objects for simplicity)
  return clean;
}

// ── Source detection ──

function detectSource(arg) {
  if (isUrl(arg)) return 'url';
  // Also accept "@name" shortcut for well-known skills
  if (arg.startsWith('@')) return 'wellknown';
  // Has a slash → treat as GitHub repo
  if (arg.includes('/')) return 'github';
  return null;
}

function parseGithubArg(arg) {
  const atIdx = arg.lastIndexOf('@');
  if (atIdx > 0) {
    return { repo: arg.slice(0, atIdx), skill: arg.slice(atIdx + 1) };
  }
  return { repo: arg, skill: null };
}

// ── GitHub cloning & discovery ──

function cloneRepo(repo, dest) {
  validateGithubRepo(repo);
  const url = `https://github.com/${repo}.git`;
  execFileSync('git', ['clone', '--depth', '1', url, dest], { stdio: 'pipe' });
}

function readFrontmatterName(skillMdPath) {
  try {
    const content = fs.readFileSync(skillMdPath, 'utf-8');
    const m = content.match(/^---\n([\s\S]*?)\n---/);
    if (m) {
      const nm = m[1].match(/^name:\s*(.+)$/m);
      if (nm) return nm[1].trim();
    }
  } catch {}
  return null;
}

function findSkillsInRepo(repoDir) {
  const results = [];

  // Multi-skill repo — skills/<name>/SKILL.md
  const skillsDir = path.join(repoDir, 'skills');
  if (fs.existsSync(skillsDir)) {
    for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillMd = path.join(skillsDir, entry.name, 'SKILL.md');
      if (!fs.existsSync(skillMd)) continue;
      const name = readFrontmatterName(skillMd) || entry.name;
      results.push({ name, dir: path.join(skillsDir, entry.name) });
    }
  }

  // Single-skill repo — root SKILL.md
  const rootMd = path.join(repoDir, 'SKILL.md');
  if (fs.existsSync(rootMd)) {
    const name = readFrontmatterName(rootMd);
    if (name && !results.some(r => r.name === name)) {
      results.push({ name, dir: repoDir });
    }
  }

  return results;
}

// ── Conflict check ──

function isPersonalSkill(name) {
  const dir = resolveInside(SKILLS_DIR, name);
  return fs.existsSync(dir) && !fs.existsSync(path.join(dir, 'GENERATION.md'));
}

// ── Multi-model adapters ──

function generateAdapters(destDir, name, description, body) {
  const adaptersDir = path.join(destDir, 'adapters');
  if (!fs.existsSync(adaptersDir)) fs.mkdirSync(adaptersDir, { recursive: true });

  // 1. Cursor .mdc rule format — place in .cursor/rules/<name>.mdc
  const cursorMdc = `---
description: ${description}
globs:
alwaysApply: false
---

${body}
`;
  fs.writeFileSync(path.join(adaptersDir, 'cursor.mdc'), cursorMdc);

  // 2. Cursor .cursorrules (legacy) — place in project root
  const cursorRules = `# ${name}
# Place this file at .cursorrules in your project root.
# It works with Cursor, Windsurf, and other Cursor-compatible IDEs.

${body}
`;
  fs.writeFileSync(path.join(adaptersDir, 'cursor.cursorrules'), cursorRules);

  // 3. GitHub Copilot — place in .github/copilot-instructions.md
  const copilotContent = `# ${name}
# Place this file at .github/copilot-instructions.md in your repository.
# GitHub Copilot will automatically read it for repository-level instructions.

${body}
`;
  fs.writeFileSync(path.join(adaptersDir, 'copilot.md'), copilotContent);

  // 4. Claude Code raw format — the original SKILL.md content for reference
  console.log(`  Generated adapters: cursor (.mdc / .cursorrules), copilot`);
}

// ── Install from URL ──

function installFromUrl(url, nameOverride, dryRun) {
  const rawUrl = validateHttpUrl(toRawGithubUrl(url));

  console.log(`Fetching ${rawUrl}...`);
  const content = execFileSync('curl', ['-fsSL', rawUrl], { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });

  if (!content || content.length < 10) {
    console.error(`  ✗ Failed to fetch content from ${rawUrl}`);
    return false;
  }

  // Parse frontmatter
  const { frontmatter, body } = parseFrontmatter(content);
  const skillName = nameOverride || frontmatter.name;
  if (!skillName) {
    console.error(`  ✗ Cannot determine skill name. Provide --name <name> or ensure the source has a "name:" field in frontmatter.`);
    return false;
  }
  try {
    validateSkillName(skillName);
  } catch (error) {
    console.error(`  ✗ ${error.message}`);
    return false;
  }

  if (isPersonalSkill(skillName)) {
    console.error(`  ✗ Cannot install "${skillName}": a personal skill with this name already exists.`);
    return false;
  }

  const destDir = resolveInside(SKILLS_DIR, skillName);

  // Check if already installed
  const genPath = path.join(destDir, 'GENERATION.md');
  if (fs.existsSync(genPath)) {
    const gen = fs.readFileSync(genPath, 'utf-8');
    const src = gen.match(/source(?:Url)?:\s*(.+)/)?.[1];
    if (src === rawUrl) {
      // Check if content is the same (compare body length as heuristic)
      const existingSkillMd = path.join(destDir, 'SKILL.md');
      if (fs.existsSync(existingSkillMd)) {
        const existingContent = fs.readFileSync(existingSkillMd, 'utf-8');
        const { body: existingBody } = parseFrontmatter(existingContent);
        if (existingBody === body) {
          console.log(`  ✓ ${skillName} is already up-to-date`);
          return true;
        }
        console.log(`  ~ ${skillName} has changed upstream, updating...`);
      }
    } else if (src) {
      console.error(`  ✗ "${skillName}" is already installed from "${src}". Remove it first:`);
      console.error(`       npm run remove-skill ${skillName}`);
      return false;
    }
  }

  if (dryRun) {
    console.log(`  ~ ${skillName} (would install from URL)`);
    return true;
  }

  // Clean frontmatter (strip model-specific fields)
  const cleanedFm = cleanFrontmatter(frontmatter);

  // Build SKILL.md — keep only name, description from original
  const skillFm = {};
  if (cleanedFm.name) skillFm.name = cleanedFm.name;
  if (cleanedFm.description) skillFm.description = cleanedFm.description;
  // Optionally preserve version if present
  if (cleanedFm.version) skillFm.version = cleanedFm.version;

  const skillContent = stringifyFrontmatter(skillFm) + body + '\n';

  console.log(`Installing ${skillName}...`);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  fs.writeFileSync(path.join(destDir, 'SKILL.md'), skillContent);
  fs.writeFileSync(path.join(destDir, 'ORIGINAL.md'), content);

  // GENERATION.md
  const generation = `---
source: ${rawUrl}
sourceType: url
name: ${skillName}
syncedAt: ${new Date().toISOString()}
---
`;
  fs.writeFileSync(genPath, generation);

  // Generate multi-model adapters (use body without frontmatter for adapter content)
  const desc = cleanedFm.description || skillName;
  generateAdapters(destDir, skillName, desc, body);

  // Update manifest (version 2: url source)
  const manifest = readManifest();
  if (!manifest.url) manifest.url = {};
  if (!manifest.url[rawUrl]) manifest.url[rawUrl] = { installedSkills: {} };
  manifest.url[rawUrl].installedSkills[skillName] = {
    name: skillName,
    syncedAt: new Date().toISOString(),
  };
  writeManifest(manifest);

  console.log(`  ✓ ${skillName} installed`);
  return true;
}

// ── Install from GitHub ──

function installFromGithub(repo, targetSkill, dryRun) {
  validateGithubRepo(repo);
  if (targetSkill) validateSkillName(targetSkill);
  const rName = repoName(repo);
  const tempDir = path.join(ROOT, `${TEMP_PREFIX}${rName}`);
  let exitCode = 0;

  try {
    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });

    console.log(`Cloning ${repo}...`);
    cloneRepo(repo, tempDir);

    const commitHash = getCommitHash(tempDir);
    const allSkills = findSkillsInRepo(tempDir);

    if (allSkills.length === 0) {
      console.error(`No skills found in ${repo}`);
      process.exit(1);
    }

    let toInstall = allSkills;
    if (targetSkill) {
      const matched = allSkills.filter(s => s.name === targetSkill);
      if (matched.length === 0) {
        console.error(`Skill "${targetSkill}" not found in ${repo}.`);
        console.error(`Available: ${allSkills.map(s => s.name).join(', ')}`);
        process.exit(1);
      }
      toInstall = matched;
    }

    for (const skill of toInstall) {
      const ok = installGithubSkill(skill, repo, commitHash, tempDir, dryRun);
      if (!ok) exitCode = 1;
    }

    fs.rmSync(tempDir, { recursive: true });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
    process.exit(1);
  }

  return exitCode;
}

function installGithubSkill(skill, repo, commitHash, repoDir, dryRun) {
  const { name, dir: srcDir } = skill;
  const destDir = resolveInside(SKILLS_DIR, name);

  if (isPersonalSkill(name)) {
    console.error(`  ✗ Cannot install "${name}": a personal skill with this name already exists.`);
    return false;
  }

  const genPath = path.join(destDir, 'GENERATION.md');
  if (fs.existsSync(genPath)) {
    const gen = fs.readFileSync(genPath, 'utf-8');
    const src = gen.match(/source:\s*(.+)/)?.[1];
    const cmt = gen.match(/commit:\s*(.+)/)?.[1];

    if (src === repo && cmt === commitHash) {
      console.log(`  ✓ ${name} is already up-to-date`);
      return true;
    }
    if (src && src !== repo) {
      console.error(`  ✗ "${name}" is already installed from "${src}". Remove it first:`);
      console.error(`       npm run remove-skill ${name}`);
      return false;
    }
  }

  if (dryRun) {
    console.log(`  ~ ${name} (would ${fs.existsSync(destDir) ? 'update' : 'install'})`);
    return true;
  }

  console.log(`Installing ${name}...`);
  const skillRelPath = path.relative(repoDir, srcDir);
  const generation = `---
source: ${repo}
sourceType: github
ref: main
commit: ${commitHash}
skillPath: ${skillRelPath}/SKILL.md
syncedAt: ${new Date().toISOString()}
---
`;
  replaceDirectory(srcDir, destDir, {
    exclude: ['.git'],
    prepare: stagingDir => fs.writeFileSync(path.join(stagingDir, 'GENERATION.md'), generation),
  });

  const manifest = readManifest();
  if (!manifest.github) manifest.github = {};
  if (!manifest.github[repo]) {
    manifest.github[repo] = { ref: 'main', installedSkills: {} };
  }
  manifest.github[repo].installedSkills[name] = {
    commit: commitHash,
    syncedAt: new Date().toISOString(),
  };
  writeManifest(manifest);

  console.log(`  ✓ ${name} installed`);
  return true;
}

// ── Main ──

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const nameOverrideIdx = args.indexOf('--name');
  const nameOverride = nameOverrideIdx >= 0 ? args[nameOverrideIdx + 1] : null;
  const arg = args.find(a => !a.startsWith('-'));

  if (!arg || arg === '--help' || arg === '-h') {
    showHelp();
    process.exit(0);
  }

  const sourceType = detectSource(arg);
  if (!sourceType) {
    console.error('Invalid argument. Use: npm run add-skill <org/repo>[@<skill>] | <url> [--name <name>]');
    process.exit(1);
  }

  let ok;

  if (sourceType === 'url') {
    ok = installFromUrl(arg, nameOverride, dryRun);
  } else if (sourceType === 'github') {
    const { repo, skill } = parseGithubArg(arg);
    ok = installFromGithub(repo, skill, dryRun);
  } else {
    console.error(`Unsupported source type: ${sourceType}`);
    process.exit(1);
  }

  if (ok) {
    // Auto-sync agent symlinks
    execSync('node scripts/sync-agent-links.js', { stdio: 'inherit', cwd: ROOT });
    console.log(`\nDone! Run 'npm run validate' to verify all skills.`);
  }

  process.exit(ok ? 0 : 1);
}

main();
