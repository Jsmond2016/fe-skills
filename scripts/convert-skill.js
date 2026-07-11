#!/usr/bin/env node

/**
 * convert-skill — 将 fe-skills 中的 skill 转换为其他 AI 平台格式
 *
 * Usage:
 *   npm run convert-skill <name>                 查看该 skill 的 adapter 状态
 *   npm run convert-skill <name> --platform all   为所有平台生成 adapter
 *   npm run convert-skill <name> --platform cursor 仅生成 Cursor format
 *   npm run convert-skill <name> --platform copilot 仅生成 Copilot format
 */

const fs = require('fs');
const path = require('path');
const { resolveInside, validateSkillName } = require('./lib/security');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');

// ── Parsing ──

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

// ── Help ──

function showHelp() {
  console.log(`
Usage:
  npm run convert-skill <name>                     Show adapter status
  npm run convert-skill <name> --platform all      Generate all adapters
  npm run convert-skill <name> --platform cursor   Generate Cursor adapter only

Platforms: cursor, copilot, all
`);
}

// ── Adapter generators ──

function genCursorMdc(name, description, body) {
  return `---
description: ${description}
globs:
alwaysApply: false
---

${body}
`;
}

function genCursorRules(name, body) {
  return `# ${name}
# Place this file at .cursorrules in your project root.
# Works with Cursor, Windsurf, and other Cursor-compatible IDEs.

${body}
`;
}

function genCopilot(name, body) {
  return `# ${name}
# Place this file at .github/copilot-instructions.md in your repository.
# GitHub Copilot reads it for repository-level instructions.

${body}
`;
}

// ── Main ──

function main() {
  const args = process.argv.slice(2);
  const platformIdx = args.indexOf('--platform');
  const platform = platformIdx >= 0 ? args[platformIdx + 1] || 'all' : 'status';
  const skillName = args.find(a => !a.startsWith('-'));

  if (!skillName || skillName === '--help' || skillName === '-h') {
    showHelp();
    process.exit(0);
  }

  try {
    validateSkillName(skillName);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  const skillDir = resolveInside(SKILLS_DIR, skillName);
  const skillMdPath = path.join(skillDir, 'SKILL.md');

  if (!fs.existsSync(skillMdPath)) {
    console.error(`Skill "${skillName}" not found at ${skillMdPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(skillMdPath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);
  const name = frontmatter.name || skillName;
  const description = frontmatter.description || name;

  if (!body) {
    console.error(`Skill "${skillName}" has no content body.`);
    process.exit(1);
  }

  const adaptersDir = path.join(skillDir, 'adapters');

  if (platform === 'status') {
    // Show current adapter status
    console.log(`\nSkill: ${name}`);
    console.log(`  Path: skills/${skillName}/SKILL.md`);
    console.log(`  Description: ${description}`);
    console.log();

    if (fs.existsSync(adaptersDir)) {
      const files = fs.readdirSync(adaptersDir).filter(f => !f.startsWith('.'));
      if (files.length > 0) {
        console.log('  Existing adapters:');
        for (const f of files) {
          const stats = fs.statSync(path.join(adaptersDir, f));
          console.log(`    ${f} (${(stats.size / 1024).toFixed(1)} KB)`);
        }
        console.log();
        console.log('  Regenerate with: npm run convert-skill ' + skillName + ' --platform all');
        return;
      }
    }
    console.log('  No adapters generated yet.');
    console.log('  Generate with: npm run convert-skill ' + skillName + ' --platform all');
    return;
  }

  // Generate adapters
  if (!fs.existsSync(adaptersDir)) {
    fs.mkdirSync(adaptersDir, { recursive: true });
  }

  const targets = platform === 'all' ? ['cursor', 'copilot'] : [platform];
  let count = 0;

  for (const t of targets) {
    switch (t) {
      case 'cursor': {
        fs.writeFileSync(path.join(adaptersDir, 'cursor.mdc'), genCursorMdc(name, description, body));
        fs.writeFileSync(path.join(adaptersDir, 'cursor.cursorrules'), genCursorRules(name, body));
        count += 2;
        break;
      }
      case 'copilot':
        fs.writeFileSync(path.join(adaptersDir, 'copilot.md'), genCopilot(name, body));
        count++;
        break;
      default:
        console.error(`Unknown platform: ${t}. Supported: cursor, copilot`);
    }
  }

  console.log(`Generated ${count} adapter file(s) for "${name}" in skills/${skillName}/adapters/`);
}

main();
