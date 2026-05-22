#!/usr/bin/env node

/**
 * sync.cjs — sync-agent-skills
 *
 * 将 .agents/skills/ 下的 skills 同步到 AI 平台目录（.claude/skills/、.codex/skills/）。
 *
 * 使用方式（在项目根目录执行）：
 *   node .agents/skills/sync-agent-skills/scripts/sync.cjs
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

function resolveAgentSource(fromDir) {
  // 从 fromDir 向上查找 .agents/skills/
  let current = path.resolve(fromDir);
  while (true) {
    const candidate = path.join(current, '.agents', 'skills');
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return { sourceDir: candidate, projectRoot: current };
    }
    // 也兼容一下原始 .agent/<skill> 扁平布局
    const flat = path.join(current, '.agent');
    if (fs.existsSync(flat) && fs.statSync(flat).isDirectory()) {
      return { sourceDir: flat, projectRoot: current };
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

function getSkillNames(sourceDir) {
  const names = [];
  if (!fs.existsSync(sourceDir)) return names;
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.') || !fs.existsSync(path.join(sourceDir, entry.name, 'SKILL.md'))) continue;
    names.push(entry.name);
  }
  return names.sort();
}

const ALL_PLATFORMS = ['claude', 'codex'];

function detectPlatforms(root) {
  // 默认同步所有平台，目录不存在会自动创建
  // --platform 参数用于限制范围而非发现
  return ALL_PLATFORMS;
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
  用法: node .agents/skills/sync-agent-skills/scripts/sync.cjs [选项]

  将 .agents/skills/ 中的 skills 同步到 AI 平台目录
  （.claude/skills/、.codex/skills/）。

  选项:
    --dry-run            预览变更，不实际执行
    --platform <names>   仅同步指定平台，如 claude,codex（默认：全部）
    --copy               复制而非符号链接
    --source <dir>       自定义源目录（默认：从脚本位置自动向上查找）
    --help, -h           显示此帮助

  示例:
    node .agents/skills/sync-agent-skills/scripts/sync.cjs
    node .agents/skills/sync-agent-skills/scripts/sync.cjs --dry-run
    node .agents/skills/sync-agent-skills/scripts/sync.cjs --platform claude
    node .agents/skills/sync-agent-skills/scripts/sync.cjs --copy
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
  const customSource = sourceIdx !== -1 && sourceIdx + 1 < args.length
    ? path.resolve(args[sourceIdx + 1]) : null;

  // ── 确定项目根目录和源目录 ──
  let sourceDir;
  let projectRoot;

  if (customSource) {
    sourceDir = customSource;
    projectRoot = path.dirname(sourceDir);
  } else {
    const resolved = resolveAgentSource(__dirname);
    if (!resolved) {
      console.error('✖ 未找到 .agents/skills/ 目录。请确认已在项目根目录执行 npx skills add。');
      console.error('  或者使用 --source <path> 指定源目录。');
      process.exit(1);
    }
    sourceDir = resolved.sourceDir;
    projectRoot = resolved.projectRoot;
  }

  console.log(`源目录: ${sourceDir}`);
  console.log(`项目根目录: ${projectRoot}`);

  // ── 扫描 skills ──
  const skillNames = getSkillNames(sourceDir);
  if (skillNames.length === 0) {
    console.warn(`⚠ 在 ${path.relative(projectRoot, sourceDir)} 中未找到包含 SKILL.md 的 skill 目录。`);
    process.exit(0);
  }
  console.log(`发现 ${skillNames.length} 个 skills`);

  // ── 确定目标平台 ──
  const platforms = platformFilter || detectPlatforms(projectRoot);

  // ── 同步 ──
  let totalCreated = 0;
  let totalRemoved = 0;
  for (const platform of platforms) {
    const targetDir = resolvePlatformDir(platform, projectRoot);
    if (!fs.existsSync(targetDir) && !dryRun) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const result = syncTarget(targetDir, skillNames, sourceDir, dryRun, useCopy);
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

main();
