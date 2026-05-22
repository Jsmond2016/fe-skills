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

`.codex/skills/` 中已创建 symlink 指向 `skills/` 下所有技能，`.codex/settings.json` 引用 Claude Code 的权限配置，在项目根目录运行 Codex 时自动可用。

## Cursor

设置 Cursor → Features → Skills Path，添加 `skills` 目录。

## 自动同步

`scripts/sync-agent-links.js` 在以下时机自动同步 symlink：
- `npm run create-skill` / `add-skill` / `remove-skill` 执行后
- `npm install` 或 `npm prepare` 执行时（含 `git clone` 后自动执行）

## Skill 规范

- `skills/<name>/SKILL.md` — YAML frontmatter 含 `name`（kebab-case）+ `description`
- description 首段出现在 skill 选择列表中，宜简短明了
- 创建新 skill：`npm run create-skill`（交互式）或手动创建
- 第三方 vendor skill 保留 `ORIGINAL.md` + `GENERATION.md`
- 多平台适配：`npm run convert-skill <name>`
