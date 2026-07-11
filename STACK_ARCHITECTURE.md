# fe-skills — 技术架构

> 本文档记录项目的核心架构决策，是 AI 理解项目设计意图的主要依据。
> 由 `fe-set-ai-base` 初始化生成，请根据实际项目情况补充完善。

## 整体架构

fe-skills 是一个前端开发 Skills 集合仓库，为 AI Agent（Claude Code、Codex、Cursor 等）提供可复用的技能指令。

每个技能是一个独立的 Markdown 文件，通过 symlink 机制注册到各 AI 工具的技能加载目录。

### 架构模式

- **模式**: 单仓库多技能（Monorepo-style Skills Collection）
- **数据流**: Skill MD → Symlink → AI Agent 加载 → 按需激活
- **渲染策略**: N/A（纯文档仓库，无 UI 运行时）

## 目录结构与职责

```
fe-skills/
├── skills/              # 技能源码（每个子目录一个 skill）
│   ├── fe-code-review/  # 代码审查技能
│   ├── fe-commit/       # 提交规范技能
│   ├── fe-react-dev-stack/  # React 开发技能
│   └── ...
├── scripts/             # 技能管理工具
├── templates/           # 新技能模板
├── .claude/skills/      # Claude Code symlink（自动同步）
├── .codex/skills/       # Codex legacy symlink（兼容旧版本）
└── .cursor/rules/       # Cursor 配置
```

| 目录 | 职责 |
|:-----|:------|
| `skills/` | 技能源码入口，每个子目录含 SKILL.md |
| `scripts/` | 技能管理 CLI（create/add/remove/update/convert/validate） |
| `templates/` | `npm run create-skill` 使用的模板 |
| `.claude/skills/` | Claude Code 技能加载目录（自动同步） |
| `.codex/skills/` | Codex 旧版兼容目录；当前 `npx skills --agent codex` 默认使用 `.agents/skills/` |

### 各层职责

- **技能层**: `skills/<name>/SKILL.md` — AI 指令的源文件
- **管理层**: `scripts/*.js` — 技能生命周期管理
- **注册层**: `.agents/skills/` / `.claude/skills/` / `.codex/skills/` — `npx skills` 通用入口、Claude Code 入口和 Codex 旧版兼容入口

## 关键架构决策（ADR）

### ADR-001: Symlink 注册机制

- **日期**: 2026-05-22
- **状态**: 接受
- **背景**: 需要在多种 AI 工具间共享同一套技能，且开发时修改技能文件后无需手动同步
- **选择**: 使用 symlink 而非文件复制，将 `skills/<name>` 链接到各 AI 工具的技能加载目录
- **结果**: 修改源文件即时生效；git 原生支持 symlink（mode 120000）

### ADR-002: 自动同步脚本

- **日期**: 2026-05-22
- **状态**: 接受
- **背景**: symlink 在新增/删除 skill 时需手动管理，容易遗漏
- **选择**: 通过 `scripts/sync-agent-links.js` 自动扫描 `skills/` 并同步到 `.claude/skills/`，同时保留 `.codex/skills/` 作为旧版兼容链接
- **结果**: 新增 skill 时自动创建 symlink，删除 skill 时自动清理，prepare 脚本确保 clone 后自动建立

## 外部依赖

| 依赖 | 用途 | 版本约束 |
|:-----|:-----|:---------|
| yaml | 技能 frontmatter 解析验证 | ^2.4.0 |

---

> **维护说明**: 每次涉及架构变更时同步更新本文档。ADR 一经接受不应删除，已废弃的决策标注状态后保留。
