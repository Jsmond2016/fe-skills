# npx skills 全局安装：Claude / Codex 能否识别？

> **验证日期**：2026-07-31；**CLI 版本**：`npx skills` 1.5.18（源码 `node_modules/skills/dist/cli.mjs` 核实）

## 问题

执行 `npx skills add --global Jsmond2016/fe-skills` 安装的 skill，可以被 Claude Code、Codex 识别和使用吗？

## 结论

**可以。** 只要装到了对应的 agent 全局目录，Claude Code 和 Codex 都能原生识别，无需额外注册。但关键点是：**`--global` 不是装到单一目录，而是按 agent 分区安装**。

## 一、`--global` 实际装到哪

CLI 按 agent 维护各自的 project / global 目录：

| Agent | project 目录 | **全局目录**（`--global`） |
| --- | --- | --- |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` |
| Codex | `.agents/skills/` | `~/.codex/skills/` |

- Claude Code 全局目录：`~/.claude/skills`（可用 `CLAUDE_CONFIG_DIR` 覆盖）
- Codex 全局目录：`~/.codex/skills`（可用 `CODEX_HOME` 覆盖）

## 二、不带 `--agent` 时的行为（容易踩坑）

`npx skills add --global Jsmond2016/fe-skills` 会**自动检测本机已安装的 agent CLI**（通过检查 `~/.claude`、`~/.codex` 等配置目录是否存在）：

- 检测到 **1 个** → 只装到该 agent
- 检测到 **多个** → 交互式让用户选择（非交互环境需加 `-y`）
- 检测到 **0 个** + `-y` → 装到全部 agent

因此结果取决于本机装了哪些 CLI。更可控的写法是显式指定目标：

```bash
# 仅装到 Claude Code 全局
npx skills add --global Jsmond2016/fe-skills --agent claude-code -y

# 仅装到 Codex 全局
npx skills add --global Jsmond2016/fe-skills --agent codex -y
```

## 三、两家能否原生识别

### Claude Code：能

- `~/.claude/skills/` 是官方用户级 skills 目录，**所有项目自动可用**，无需在 `settings.json` 注册。
- 装完后**重启 Claude Code 会话**生效（skill 在启动时加载）。

### Codex：能

- `~/.codex/skills/` 是用户级全局目录，另外支持：
  - project 级：`.codex/skills/`
  - agent 无关：`.agents/skills/`（仓库级与 `~/.agents/skills/`）
  - 系统级：`/etc/codex/skills/`
- 优先级：project-local > user-global > system-wide
- 装完后**重启 Codex** 生效。

两家都支持标准 `skills/<name>/SKILL.md` 结构，与 fe-skills 格式完全兼容。

## 四、注意点

1. **README 过时**：fe-skills README 声称 `--global` 装到 `~/.skills/`，并指导用 `~/.claude/settings.json` 的 `skills.paths` 指向 `~/.skills/fe-skills/skills`。但 1.5.18 源码中**不存在 `~/.skills/` 安装路径**，全局技能已改为按 agent 分区。该段文档需要按实际版本更新。
2. **Claude Code 已知 bug**：[anthropics/claude-code#44207](https://github.com/anthropics/claude-code/issues/44207) — 项目存在 `.claude/skills/` 时，某些版本不加载全局 `~/.claude/skills/`。规避方式：把全局 skill symlink 进项目目录。
3. **全局更新/移除命令**：`npx skills update -g -y`、`npx skills remove -g`。

## 参考来源

- Skills — Claude Code Docs：https://code.claude.com/docs/en/agent-sdk/skills
- anthropics/claude-code#44207 — Global skills not discovered：https://github.com/anthropics/claude-code/issues/44207
- openai/codex#17111 — AGENTS.md 加载差异：https://github.com/openai/codex/issues/17111
- ai-agents-skills — agent skill locations：https://github.com/hoanganhduc/ai-agents-skills/blob/main/docs/agent-locations.md
