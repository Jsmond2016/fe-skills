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

function formatDate(iso) {
  if (!iso) return 'unknown';
  const d = new Date(iso);
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function main() {
  const manifest = readManifest();
  const vendorSkills = [];

  // Collect from manifest — github sources
  for (const [repo, entry] of Object.entries(manifest.github || {})) {
    for (const [name, info] of Object.entries(entry.installedSkills || {})) {
      const dir = path.join(SKILLS_DIR, name);
      const exists = fs.existsSync(dir);
      vendorSkills.push({
        name,
        source: repo,
        type: 'github',
        commit: info.commit ? info.commit.slice(0, 8) : '?',
        syncedAt: info.syncedAt,
        exists,
      });
    }
  }

  // Collect from manifest — url sources
  for (const [url, entry] of Object.entries(manifest.url || {})) {
    for (const [name, info] of Object.entries(entry.installedSkills || {})) {
      const dir = path.join(SKILLS_DIR, name);
      const exists = fs.existsSync(dir);
      vendorSkills.push({
        name,
        source: url,
        type: 'url',
        commit: null,
        syncedAt: info.syncedAt,
        exists,
      });
    }
  }

  // Sort by name
  vendorSkills.sort((a, b) => a.name.localeCompare(b.name));

  console.log('\n── Vendor Skills ──\n');
  if (vendorSkills.length === 0) {
    console.log('  No vendor skills installed.');
    console.log('  Use "npm run add-skill <org/repo>[@<skill>]" to install one.');
    console.log();
    process.exit(0);
  }

  for (const s of vendorSkills) {
    const status = s.exists ? '✓' : '✗ (directory missing)';
    console.log(`  ${status} ${s.name}`);
    if (s.type === 'url') {
      console.log(`      source:  ${s.source}`);
    } else {
      console.log(`      source:  ${s.source}@${s.commit}`);
    }
    console.log(`      synced:  ${formatDate(s.syncedAt)}`);
    console.log();
  }

  console.log(`Total: ${vendorSkills.length} vendor skill(s)\n`);
}

main();
