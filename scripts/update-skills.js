#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync, execSync } = require('child_process');
const { resolveInside, validateGithubRepo, validateSkillName } = require('./lib/security');
const { replaceDirectory } = require('./lib/files');
const { readManifest: readManifestFile } = require('./lib/manifest');
const { installFromUrl } = require('./add-skill');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const MANIFEST_PATH = path.join(ROOT, 'skill-dependencies.json');
const TEMP_PREFIX = '.sync-tmp-';

function readManifest() {
  return readManifestFile(MANIFEST_PATH, () => ({ version: 1, github: {}, url: {} }));
}

function getCommitHash(dir) {
  return execSync('git rev-parse HEAD', { cwd: dir }).toString().trim();
}

function cloneRepo(repo, dest) {
  validateGithubRepo(repo);
  const url = `https://github.com/${repo}.git`;
  execFileSync('git', ['clone', '--depth', '1', url, dest], { stdio: 'pipe' });
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
  const urlKeys = Object.keys(manifest.url || {});

  if (repos.length === 0 && urlKeys.length === 0) {
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
        validateSkillName(skillName);
        const skillDir = resolveInside(SKILLS_DIR, skillName);
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
        replaceDirectory(srcDir, skillDir, {
          exclude: ['.git'],
          prepare: stagingDir => fs.writeFileSync(
            path.join(stagingDir, 'GENERATION.md'),
            generateGenerationMd(repo, latestCommit, skillRelPath),
          ),
        });

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

  // URL-sourced skills（通过 HTTP 抓取原始 SKILL.md，有变更时重新安装）
  for (const url of urlKeys) {
    const entry = manifest.url[url];
    const skills = Object.keys(entry.installedSkills || {});
    if (skills.length === 0) continue;

    console.log(`\nChecking ${url}...`);
    for (const skillName of skills) {
      try {
        const status = installFromUrl(url, null, false, { skipManifestWrite: true });
        if (status === 'installed') {
          // installFromUrl 负责更新 SKILL.md / ORIGINAL.md / GENERATION.md / adapters，
          // 此处仅记录同步时间（manifest 由本函数在最后统一写入）
          entry.installedSkills[skillName].syncedAt = new Date().toISOString();
          updated++;
        } else if (status === 'up-to-date') {
          upToDate++;
        } else {
          failed++;
        }
      } catch (err) {
        console.error(`  ✗ Failed to update ${skillName}: ${err.message}`);
        failed++;
      }
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
