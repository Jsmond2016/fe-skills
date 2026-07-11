# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FE-Skills — 前端开发 Skills 集合，兼容 npx skills CLI。本项目自身是 skill 仓库，包含大量前端相关 skill（代码审查、提交规范、React 开发栈、TailwindCSS、项目管理等），同时也管理第三方 vendor skill。

## Project Structure

- `skills/<skill-name>/SKILL.md` — 每个 skill 一个子目录，以 SKILL.md 为入口（YAML frontmatter 定义 name + description）
- `scripts/` — skill 管理工具（create/add/remove/update/convert/validate）
- `templates/skill/` — 新 skill 模板
- `skill-dependencies.json` — 第三方 vendor skill 依赖清单

## Available Commands

```bash
npm run create-skill   # 交互式创建新 skill
npm run add-skill      # 从外部安装 skill
npm run remove-skill   # 移除 vendor skill
npm run update-skills  # 更新所有 vendor skill
npm run skill-status   # 查看 vendor skill 状态
npm run convert-skill  # 转换为其他 AI 平台格式
npm run validate       # / npm test — 校验所有 skill
```

## Claude Code

`.claude/skills/` 中已创建 symlink 指向 `skills/` 下所有技能，项目根目录运行 Claude Code 时自动可用。

## Codex

当前 `npx skills` 将 Codex project-level skills 安装并记录在 `.agents/skills/`。本仓库保留 `.codex/skills/` symlink 作为旧版本兼容和本地开发便利，不再作为消费者项目的默认安装目标。

## Cursor

设置 Cursor → Features → Skills Path，添加 `skills` 目录。

## 自动同步

`scripts/sync-agent-links.js` 在以下时机自动同步 `skills/` → `.claude/skills/`，并保留 `.codex/skills/` legacy symlink：
- `npm run create-skill` / `add-skill` / `remove-skill` 执行后
- `npm install` 或 `npm prepare` 执行时（含 `git clone` 后自动执行）

## 消费端：从 .agents/skills/ 同步到平台目录

`skills/sync-agent-skills/` 是一个工具 skill，内置了同步脚本。当前 Codex 可直接使用 `npx skills add --agent codex` 生成的 `.agents/skills/`；该脚本默认只解决 Claude Code 需要 `.claude/skills/` 的同步问题。`.codex/skills/` 仅在旧版兼容场景下显式同步。

消费者工作流：

```bash
# 1. 安装 skills 到 Codex（生成 .agents/skills/）
npx skills add fe-skills --skill '*' --agent codex -y

# 2. 如需 Claude Code 也可用，同步到 .claude/skills/
node .agents/skills/sync-agent-skills/scripts/sync.cjs

# 可选参数
node .agents/skills/sync-agent-skills/scripts/sync.cjs --dry-run         # 预览
node .agents/skills/sync-agent-skills/scripts/sync.cjs --platform claude # 仅 Claude Code
node .agents/skills/sync-agent-skills/scripts/sync.cjs --platform codex  # 旧版 Codex 兼容
node .agents/skills/sync-agent-skills/scripts/sync.cjs --copy            # 复制而非链接
```

原理：`npx skills add` 将 `skills/sync-agent-skills/` 安装到 `.agents/skills/sync-agent-skills/`，其 `scripts/sync.cjs` 可自动检测 `.agents/skills/` 位置并扫描所有 skill，为需要额外注册目录的平台创建 symlink。

## Skill 规范

- `skills/<name>/SKILL.md` — YAML frontmatter 含 `name`（kebab-case）+ `description`
- description 首段出现在 skill 选择列表中，宜简短明了
- 创建新 skill：`npm run create-skill`（交互式）或手动创建
- 第三方 vendor skill 保留 `ORIGINAL.md` + `GENERATION.md`
- 多平台适配：`npm run convert-skill <name>`
