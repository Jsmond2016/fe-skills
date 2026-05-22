#!/usr/bin/env node

/**
 * sync-agent-links.js
 *
 * 同步 skills/ → .claude/skills/ 和 .codex/skills/ 的 symlink。
 * 在 create / add / remove skill 后自动调用，确保三种 AI 工具始终加载最新 skill 列表。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const TARGETS = ['.claude/skills', '.codex/skills'];

// ── Help ──

function showHelp() {
  console.log(`
Usage: node scripts/sync-agent-links.js [--dry-run]

Sync skills/ symlinks to .claude/skills/ and .codex/skills/.

Options:
  --dry-run    Show what would change without making changes
`);
}

// ── Core ──

function getSkillNames() {
  const names = [];
  if (!fs.existsSync(SKILLS_DIR)) return names;
  for (const entry of fs.readdirSync(SKILLS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.') || !fs.existsSync(path.join(SKILLS_DIR, entry.name, 'SKILL.md'))) continue;
    names.push(entry.name);
  }
  return names.sort();
}

function syncTarget(targetDir, skillNames, dryRun) {
  const absTarget = path.join(ROOT, targetDir);
  if (!fs.existsSync(absTarget)) {
    if (dryRun) {
      console.log(`  mkdir ${targetDir}/`);
    } else {
      fs.mkdirSync(absTarget, { recursive: true });
    }
  }

  // Read existing entries in target
  let existing = [];
  if (fs.existsSync(absTarget)) {
    existing = fs.readdirSync(absTarget, { withFileTypes: true })
      .filter(e => !e.name.startsWith('.'))
      .map(e => e.name);
  }

  const skillSet = new Set(skillNames);

  // Remove stale symlinks (skill no longer exists)
  let removed = 0;
  for (const name of existing) {
    if (!skillSet.has(name)) {
      const linkPath = path.join(absTarget, name);
      if (dryRun) {
        console.log(`  rm ${targetDir}/${name}`);
      } else {
        fs.rmSync(linkPath, { force: true });
      }
      removed++;
    }
  }

  // Create missing symlinks
  let created = 0;
  for (const name of skillNames) {
    const linkPath = path.join(absTarget, name);
    if (!fs.existsSync(linkPath)) {
      const relativePath = path.relative(absTarget, path.join(SKILLS_DIR, name));
      if (dryRun) {
        console.log(`  ln -s ${relativePath} ${targetDir}/${name}`);
      } else {
        fs.symlinkSync(relativePath, linkPath, 'dir');
      }
      created++;
    }
  }

  return { created, removed };
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const skillNames = getSkillNames();
  console.log(`Found ${skillNames.length} skills in skills/`);

  let totalCreated = 0;
  let totalRemoved = 0;

  for (const target of TARGETS) {
    const result = syncTarget(target, skillNames, dryRun);
    totalCreated += result.created;
    totalRemoved += result.removed;
    const action = dryRun ? 'would sync' : 'synced';
    console.log(`  ${target}/ ${action} (${result.created} created, ${result.removed} removed)`);
  }

  if (dryRun) {
    console.log('\nDry-run complete. Pass no flags to apply changes.');
  } else if (totalCreated === 0 && totalRemoved === 0) {
    console.log('All links up-to-date.');
  }
}

main();
