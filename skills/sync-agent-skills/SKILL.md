---
name: sync-agent-skills
description: >-
  将 .agent/ 中已安装的 skills 同步到 AI 平台目录（.claude/skills/、.codex/skills/）。
  安装后执行：node .agent/sync-agent-skills/scripts/sync.cjs
---

# sync-agent-skills

`npx skills add` 安装的 skills 存放在 `.agent/` 目录，但 Claude Code 识别 `.claude/skills/`，Codex 识别 `.codex/skills/`。

本 skill 提供一个同步脚本，一键将 `.agent/` 中所有 skills 链接到各 AI 平台的标准目录。

## 使用

```bash
# 安装所有 fe-skills
npx skills add fe-skills

# 执行同步（链接到 .claude/skills/、.codex/skills/）
node .agent/sync-agent-skills/scripts/sync.cjs
```

## 选项

| 参数 | 说明 |
|------|------|
| `--dry-run` | 预览变更，不实际执行 |
| `--platform claude,codex` | 仅同步指定平台（逗号分隔） |
| `--copy` | 复制文件而非创建符号链接（Windows 或禁用 symlink 场景） |
| `--source ./custom-agent` | 指定自定义源目录 |
