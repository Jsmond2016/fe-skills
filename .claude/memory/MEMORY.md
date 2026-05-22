<!-- .claude/memory/MEMORY.md -->

# Memory Index

> 跨会话持久记忆索引。每次会话结束时记录关键变更和待办事项。
> 按日期倒序排列，最新的条目在顶部。

## 2026-05-22

- 完整配置 Claude Code / Codex / Cursor 三平台项目级 skills 自动加载
- 新增 `scripts/sync-agent-links.js` 自动同步脚本，集成到 create/add/remove skill 流程
- `npm install` / `git clone` 后自动通过 prepare 脚本重建所有 symlink
- 修复 `.gitignore` 仅忽略 `settings.local.json`，允许 skills symlink 提交
- 补充 AGENTS.md、STACK_ARCHITECTURE.md、DESIGN.md 三个 AI 协作文档
- 创建 `.claude/settings.json` 项目级设置和 `.claude/memory/MEMORY.md` 记忆索引
- 更新 `.cursor/rules/skills-config.mdc` 补充上下文文件引用
