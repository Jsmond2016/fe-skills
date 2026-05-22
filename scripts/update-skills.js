#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const MANIFEST_PATH = path.join(ROOT, 'skill-dependencies.json');
const TEMP_PREFIX = '.sync-tmp-';

function readManifest() {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  } catch {
    return { version: 1, github: {} };
  }
}

function getCommitHash(dir) {
  return execSync('git rev-parse HEAD', { cwd: dir }).toString().trim();
}

function cloneRepo(repo, dest) {
  const url = `https://github.com/${repo}.git`;
  execSync(`git clone --depth 1 ${url} "${dest}"`, { stdio: 'pipe' });
}

function generateGenerationMd(repo, commitHash, skillRelPath) {
  return `---
source: ${repo}
sourceType: github
ref: main
commit: ${commitHash}
skillPath: ${skillRelPath}/SKILL.md
syncedAt: ${new Date().toISOString()}
---
`;
}

async function main() {
  const manifest = readManifest();
  const githubEntries = manifest.github || {};
  const repos = Object.keys(githubEntries);

  if (repos.length === 0) {
    console.log('No vendor skills to update.');
    return;
  }

  let updated = 0;
  let upToDate = 0;
  let failed = 0;

  for (const repo of repos) {
    const entry = githubEntries[repo];
    const skills = Object.keys(entry.installedSkills || {});
    if (skills.length === 0) continue;

    const repoName = repo.split('/')[1] || repo;
    const tempDir = path.join(ROOT, `${TEMP_PREFIX}${repoName}`);

    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true });
      }

      console.log(`\nChecking ${repo}...`);
      cloneRepo(repo, tempDir);
      const latestCommit = getCommitHash(tempDir);

      for (const skillName of skills) {
        const skillDir = path.join(SKILLS_DIR, skillName);
        const genPath = path.join(skillDir, 'GENERATION.md');
        const recorded = entry.installedSkills[skillName];

        if (!fs.existsSync(skillDir)) {
          console.log(`  ! ${skillName} directory missing, will re-install`);
        } else if (recorded.commit === latestCommit) {
          console.log(`  ✓ ${skillName} is up-to-date`);
          upToDate++;
          continue;
        }

        // Find the skill in the cloned repo
        const skillsDir = path.join(tempDir, 'skills');
        let srcDir = null;
        let skillRelPath = '';

        if (fs.existsSync(skillsDir)) {
          for (const entry2 of fs.readdirSync(skillsDir, { withFileTypes: true })) {
            if (!entry2.isDirectory()) continue;
            if (entry2.name === skillName) {
              srcDir = path.join(skillsDir, entry2.name);
              skillRelPath = `skills/${entry2.name}`;
              break;
            }
          }
        }

        // Also check root SKILL.md
        if (!srcDir) {
          const rootMd = path.join(tempDir, 'SKILL.md');
          if (fs.existsSync(rootMd)) {
            srcDir = tempDir;
            skillRelPath = '.';
          }
        }

        if (!srcDir) {
          console.log(`  ✗ ${skillName}: source not found in latest ${repo}. The skill may have been renamed or removed.`);
          failed++;
          continue;
        }

        // Re-install
        console.log(`  Updating ${skillName}...`);
        if (!fs.existsSync(skillDir)) {
          fs.mkdirSync(skillDir, { recursive: true });
        }

        const entries = fs.readdirSync(srcDir, { withFileTypes: true });
        for (const e of entries) {
          if (e.name.startsWith('.git')) continue;
          const srcPath = path.join(srcDir, e.name);
          const destPath = path.join(skillDir, e.name);
          if (e.isDirectory()) {
            execSync(`cp -R "${srcPath}" "${destPath}"`, { stdio: 'pipe' });
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }

        fs.writeFileSync(genPath, generateGenerationMd(repo, latestCommit, skillRelPath));

        // Update manifest
        entry.installedSkills[skillName] = {
          commit: latestCommit,
          syncedAt: new Date().toISOString(),
        };

        updated++;
      }

      fs.rmSync(tempDir, { recursive: true });
    } catch (err) {
      console.error(`  ✗ Failed to update ${repo}: ${err.message}`);
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true });
      }
      failed++;
    }
  }

  writeManifest(manifest);

  console.log('\n── Summary ──');
  if (updated) console.log(`  Updated: ${updated}`);
  if (upToDate) console.log(`  Up-to-date: ${upToDate}`);
  if (failed) console.log(`  Failed: ${failed}`);
  if (!updated && !upToDate && !failed) console.log('  No changes.');
  console.log(`\nDone! Run 'npm run validate' to verify all skills.`);
}

function writeManifest(m) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(m, null, 2) + '\n');
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
