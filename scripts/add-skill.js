#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const MANIFEST_PATH = path.join(ROOT, 'skill-dependencies.json');
const TEMP_PREFIX = '.sync-tmp-';

function showHelp() {
  console.log(`
Usage:
  npm run add-skill <org/repo>@<skill>    Install a specific skill from a multi-skill repo
  npm run add-skill <org/repo>             Install all skills from a multi-skill repo, or a single-skill repo

Examples:
  npm run add-skill antfu/skills@vue       Install the "vue" skill from antfu/skills
  npm run add-skill antfu/skills           Install ALL skills from antfu/skills
  npm run add-skill chen8254d/antd-skills  Install ant-design from its repo
`);
}

// ---------- util ----------

function parseArg(arg) {
  if (!arg) return null;
  const atIdx = arg.lastIndexOf('@');
  if (atIdx > 0 && arg.includes('/')) {
    return { repo: arg.slice(0, atIdx), skill: arg.slice(atIdx + 1) };
  }
  if (arg.includes('/')) {
    return { repo: arg, skill: null };
  }
  return null;
}

function readManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  } catch {
    return { version: 1, github: {} };
  }
}

function writeManifest(m) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(m, null, 2) + '\n');
}

function getCommitHash(dir) {
  return execSync('git rev-parse HEAD', { cwd: dir }).toString().trim();
}

function getRepoName(repo) {
  return repo.split('/')[1] || repo;
}

// ---------- git ----------

function cloneRepo(repo, dest) {
  const url = `https://github.com/${repo}.git`;
  execSync(`git clone --depth 1 ${url} "${dest}"`, { stdio: 'pipe' });
}

// ---------- skill discovery ----------

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

  // Mode A: multi-skill repo — skills/<name>/SKILL.md
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

  // Mode B: single-skill repo — root SKILL.md
  const rootMd = path.join(repoDir, 'SKILL.md');
  if (fs.existsSync(rootMd)) {
    const name = readFrontmatterName(rootMd);
    if (name) {
      // Don't add if already found via mode A
      if (!results.some(r => r.name === name)) {
        results.push({ name, dir: repoDir });
      }
    }
  }

  return results;
}

// ---------- installation ----------

function isPersonalSkill(skillName) {
  const dir = path.join(SKILLS_DIR, skillName);
  return fs.existsSync(dir) && !fs.existsSync(path.join(dir, 'GENERATION.md'));
}

function installSkill(skill, repo, commitHash, dryRun) {
  const { name, dir: srcDir } = skill;
  const destDir = path.join(SKILLS_DIR, name);

  // Conflict check: personal skill with same name
  if (isPersonalSkill(name)) {
    console.error(`  ✗ Cannot install "${name}": a personal skill with this name already exists.`);
    return false;
  }

  // Read existing GENERATION.md to check status
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
    // src === repo but commit differs => needs update
  }

  if (dryRun) {
    const action = fs.existsSync(destDir) ? 'would update' : 'would install';
    console.log(`  ~ ${name} (${action})`);
    return true;
  }

  // Copy files
  console.log(`  Installing ${name}...`);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.git')) continue;
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      execSync(`cp -R "${srcPath}" "${destPath}"`, { stdio: 'pipe' });
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }

  // Write GENERATION.md
  const skillRelPath = path.relative(repoDirForGeneration, srcDir);
  const generation = `---
source: ${repo}
sourceType: github
ref: main
commit: ${commitHash}
skillPath: ${skillRelPath}/SKILL.md
syncedAt: ${new Date().toISOString()}
---
`;
  fs.writeFileSync(genPath, generation);

  // Update manifest
  const manifest = readManifest();
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

let repoDirForGeneration = ''; // hack for relative path calc

// ---------- main ----------

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const arg = args.find(a => !a.startsWith('-'));

  if (!arg || arg === '--help' || arg === '-h') {
    showHelp();
    process.exit(0);
  }

  const parsed = parseArg(arg);
  if (!parsed) {
    console.error('Invalid argument. Use: npm run add-skill <org/repo>[@<skill>]');
    process.exit(1);
  }

  const { repo, skill: targetSkill } = parsed;
  const repoName = getRepoName(repo);
  const tempDir = path.join(ROOT, `${TEMP_PREFIX}${repoName}`);

  let exitCode = 0;

  try {
    // Clean up leftover temp
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }

    console.log(`Cloning ${repo}...`);
    cloneRepo(repo, tempDir);

    repoDirForGeneration = tempDir;

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
      const ok = installSkill(skill, repo, commitHash, dryRun);
      if (!ok) exitCode = 1;
    }

    // Cleanup
    fs.rmSync(tempDir, { recursive: true });

    console.log(`\nDone! Run 'npm run validate' to verify all skills.`);
    process.exit(exitCode);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
    process.exit(1);
  }
}

main();
