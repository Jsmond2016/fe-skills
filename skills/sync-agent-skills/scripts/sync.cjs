#!/usr/bin/env node

/**
 * sync.js — sync-agent-skills
 *
 * 将 .agent/ 目录下的 skills 同步到 AI 平台目录（.claude/skills/、.codex/skills/）。
 *
 * 使用方式（在项目根目录执行）：
 *   node .agent/sync-agent-skills/scripts/sync.js
 *
 * 选项：
 *   --dry-run            预览变更
 *   --platform <names>   仅同步指定平台，如 claude,codex（默认全部）
 *   --copy               复制而非符号链接
 *   --source <dir>       自定义源目录（默认自动检测）
 *   --help, -h           显示帮助
 */

const fs = require('fs');
const path = require('path');

// ── 工具 ──

function resolvePlatformDir(platform, root) {
  const dirs = {
    claude: '.claude/skills',
    codex: '.codex/skills',
  };
  return path.join(root, dirs[platform]);
}

// ── 检测 ──

function findAgentDir(fromDir) {
  let current = path.resolve(fromDir);
  while (true) {
    const candidate = path.join(current, '.agent');
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function getSkillNames(agentDir) {
  const names = [];
  if (!fs.existsSync(agentDir)) return names;
  for (const entry of fs.readdirSync(agentDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.') || !fs.existsSync(path.join(agentDir, entry.name, 'SKILL.md'))) continue;
    names.push(entry.name);
  }
  return names.sort();
}

function detectPlatforms(root) {
  const platforms = [];
  if (fs.existsSync(path.join(root, '.claude'))) platforms.push('claude');
  if (fs.existsSync(path.join(root, '.codex'))) platforms.push('codex');
  return platforms;
}

// ── 同步 ──

function syncTarget(targetDir, skillNames, sourceDir, dryRun, useCopy) {
  if (!fs.existsSync(targetDir)) {
    if (dryRun) console.log(`  mkdir -p ${targetDir}/`);
    else fs.mkdirSync(targetDir, { recursive: true });
  }

  // 读取目标目录现有内容
  let existing = [];
  if (fs.existsSync(targetDir)) {
    existing = fs.readdirSync(targetDir, { withFileTypes: true })
      .filter(e => !e.name.startsWith('.'))
      .map(e => e.name);
  }

  const skillSet = new Set(skillNames);

  // 删除失效链接（skill 已被移除的）
  let removed = 0;
  for (const name of existing) {
    if (!skillSet.has(name)) {
      const linkPath = path.join(targetDir, name);
      if (dryRun) {
        console.log(`  rm ${path.relative(path.dirname(targetDir), linkPath)}`);
      } else {
        fs.rmSync(linkPath, { force: true, recursive: true });
      }
      removed++;
    }
  }

  // 创建缺失的链接/副本
  let created = 0;
  for (const name of skillNames) {
    const linkPath = path.join(targetDir, name);
    if (fs.existsSync(linkPath)) continue;

    const skillSource = path.join(sourceDir, name);
    if (useCopy) {
      if (dryRun) {
        console.log(`  cp -r ${path.relative(path.dirname(targetDir), skillSource)} → ${path.relative(path.dirname(targetDir), linkPath)}`);
      } else {
        fs.cpSync(skillSource, linkPath, { recursive: true });
      }
    } else {
      const relative = path.relative(targetDir, skillSource);
      if (dryRun) {
        console.log(`  ln -s ${relative} ${path.relative(path.dirname(targetDir), linkPath)}`);
      } else {
        fs.symlinkSync(relative, linkPath, 'dir');
      }
    }
    created++;
  }

  return { created, removed };
}

// ── 帮助 ──

function showHelp() {
  console.log(`
用法: node .agent/sync-agent-skills/scripts/sync.js [选项]

将 .agent/ 中的 skills 同步到 AI 平台目录（.claude/skills/、.codex/skills/）。

选项:
  --dry-run            预览变更，不实际执行
  --platform <names>   仅同步指定平台，如 claude,codex（默认：自动检测）
  --copy               复制而非符号链接
  --source <dir>       自定义源目录（默认：从脚本位置自动向上查找 .agent/）
  --help, -h           显示此帮助

示例:
  node .agent/sync-agent-skills/scripts/sync.js
  node .agent/sync-agent-skills/scripts/sync.js --dry-run
  node .agent/sync-agent-skills/scripts/sync.js --platform claude
  node .agent/sync-agent-skills/scripts/sync.js --copy
`);
}

// ── 主流程 ──

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const dryRun = args.includes('--dry-run');
  const useCopy = args.includes('--copy');

  // 解析 --platform
  const platformIdx = args.indexOf('--platform');
  let platformFilter = null;
  if (platformIdx !== -1 && platformIdx + 1 < args.length) {
    platformFilter = args[platformIdx + 1].split(',').map(s => s.trim().toLowerCase());
  }

  // 解析 --source
  const sourceIdx = args.indexOf('--source');
  let agentDir = null;
  if (sourceIdx !== -1 && sourceIdx + 1 < args.length) {
    agentDir = path.resolve(args[sourceIdx + 1]);
  }

  // ── 确定项目根目录和 .agent/ 路径 ──
  const projectRoot = agentDir ? path.dirname(agentDir) : findProjectRoot();
  if (!agentDir) {
    agentDir = findAgentDir(__dirname);
  }

  if (!agentDir || !fs.existsSync(agentDir)) {
    console.error('✖ 未找到 .agent/ 目录。请确认已在项目根目录执行 npx skills add。');
    console.error('  或者使用 --source <path> 指定源目录。');
    process.exit(1);
  }

  console.log(`源目录: ${agentDir}`);
  console.log(`项目根目录: ${projectRoot}`);

  // ── 扫描 skills ──
  const skillNames = getSkillNames(agentDir);
  if (skillNames.length === 0) {
    console.warn('⚠ 在 .agent/ 中未找到包含 SKILL.md 的 skill 目录。');
    process.exit(0);
  }
  console.log(`发现 ${skillNames.length} 个 skills`);

  // ── 检测目标平台 ──
  let platforms = platformFilter || detectPlatforms(projectRoot);
  if (platforms.length === 0) {
    console.warn('⚠ 未检测到 AI 平台目录（.claude/、.codex/），也没有通过 --platform 指定。');
    console.warn('  请先在项目中初始化 AI 工具配置，或使用 --platform 参数。');
    process.exit(0);
  }

  // ── 同步 ──
  let totalCreated = 0;
  let totalRemoved = 0;
  for (const platform of platforms) {
    const targetDir = resolvePlatformDir(platform, projectRoot);
    if (!fs.existsSync(targetDir) && !dryRun) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const result = syncTarget(targetDir, skillNames, agentDir, dryRun, useCopy);
    totalCreated += result.created;
    totalRemoved += result.removed;
    const mode = useCopy ? 'copied' : 'linked';
    const action = dryRun ? 'would sync' : 'synced';
    console.log(`  .${platform}/skills/ ${action} (${result.created} ${mode}, ${result.removed} removed)`);
  }

  if (dryRun) {
    console.log('\n预览完成。移除 --dry-run 后执行实际同步。');
  } else if (totalCreated === 0 && totalRemoved === 0) {
    console.log('所有链接已是最新。');
  }
}

function findProjectRoot() {
  // 从脚本位置向上查找，找到包含 .agent/ 的目录
  const agentDir = findAgentDir(__dirname);
  return agentDir ? path.dirname(agentDir) : process.cwd();
}

main();
