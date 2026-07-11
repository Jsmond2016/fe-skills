---
name: sync-agent-skills
description: >-
  将 .agents/skills/ 中已安装的 skills 同步到需要额外注册目录的 AI 平台。
  安装后执行：node .agents/skills/sync-agent-skills/scripts/sync.cjs
---

# sync-agent-skills

`npx skills add` 安装的 skills 存放在 `.agents/skills/` 目录。当前 `npx skills` 已将 Codex project-level skills 记录在 `.agents/skills/`，无需再同步到 `.codex/skills/`。

本 skill 提供一个同步脚本，默认将 `.agents/skills/` 中所有 skills 链接到 Claude Code 的 `.claude/skills/`。如需兼容旧版 Codex，可显式指定 `--platform codex`。

## 使用

```bash
# 安装所有 fe-skills 到 Codex
npx skills add fe-skills --skill '*' --agent codex -y

# 如需 Claude Code 也可用，执行同步（链接到 .claude/skills/）
node .agents/skills/sync-agent-skills/scripts/sync.cjs
```

执行后，脚本会自动：
1. 检测项目中的 `.agents/skills/` 目录
2. 扫描所有含 `SKILL.md` 的 skill
3. 自动创建 `.claude/skills/`（如不存在）
4. 为每个 skill 创建 symlink 到目标目录
5. 清理已删除 skill 的旧链接

## 选项

| 参数 | 说明 |
|------|------|
| `--dry-run` | 预览变更，不实际执行 |
| `--platform claude,codex` | 仅同步指定平台（逗号分隔；默认 `claude`，`codex` 为旧版兼容） |
| `--copy` | 复制文件而非创建符号链接（Windows 或禁用 symlink 场景） |
| `--source ./custom-agent` | 指定自定义源目录 |
