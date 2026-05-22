#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const MANIFEST_PATH = path.join(ROOT, 'skill-dependencies.json');

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

function showHelp() {
  console.log(`
Usage:
  npm run remove-skill <skill-name>     Remove a vendor skill

Examples:
  npm run remove-skill vue              Remove the "vue" vendor skill
  npm run remove-skill vue vite pinia   Remove multiple skills
  `);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    process.exit(0);
  }

  const manifest = readManifest();
  let removed = 0;
  let notFound = 0;

  for (const skillName of args) {
    const skillDir = path.join(SKILLS_DIR, skillName);
    const genPath = path.join(skillDir, 'GENERATION.md');

    if (!fs.existsSync(skillDir)) {
      console.log(`! ${skillName}: not found`);
      notFound++;
      continue;
    }

    if (!fs.existsSync(genPath)) {
      console.log(`! ${skillName}: is a personal skill, not a vendor skill. Use "git rm -rf skills/${skillName}" to remove manually.`);
      notFound++;
      continue;
    }

    // Remove directory
    fs.rmSync(skillDir, { recursive: true });
    console.log(`✓ ${skillName} removed`);

    // Remove from manifest
    for (const repo of Object.keys(manifest.github)) {
      const installed = manifest.github[repo].installedSkills;
      if (installed[skillName]) {
        delete installed[skillName];
        // Clean up empty repo entries
        if (Object.keys(installed).length === 0) {
          delete manifest.github[repo];
        }
        break;
      }
    }

    removed++;
  }

  writeManifest(manifest);
  console.log(`\nDone: ${removed} skill(s) removed.`);
  if (notFound) console.log(`Skipped: ${notFound} skill(s) not found.`);

  // Auto-sync agent symlinks
  require('child_process').execSync('node scripts/sync-agent-links.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
}

main();
