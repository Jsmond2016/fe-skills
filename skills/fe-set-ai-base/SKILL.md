---
name: fe-set-ai-base
description: AI 工程化配置初始化 — 自动检测项目并生成 CLAUDE.md、AGENTS.md、STACK_ARCHITECTURE.md、DESIGN.md，初始化 .claude/ 等 AI 协作配置。适用于未配置过 AI 上下文的项目。
---

# AI 工程化基础配置 (fe-set-ai-base)

为任意项目初始化 AI 工程化配置。自动检测项目信息、技术栈和已有配置，生成与工具解耦的 AI 协作上下文文件，让 AI Agent（Claude Code、Cursor 等）开箱即用地理解项目。

参考文件在本 skill 的 `reference/` 目录下，按需读取使用。

## 工作流程

```
探测 → 按文件生成 → 冲突处理 → 验证
```

---

## 1. 项目探测

### 1.1 读取 package.json

```bash
cat package.json 2>/dev/null || echo "{}"
```

提取：`name`、`version`、`description`、`scripts`、`dependencies`、`devDependencies`

### 1.2 检测技术栈

从 `dependencies`/`devDependencies` 识别框架、构建、语言、CSS、测试、数据库、Monorepo、包管理器、Lint 等。详细检测对照表见 `reference/tech-stack-detection.md`。

识别到依赖时映射为可读名称：

```
react → "React 18+",  next → "Next.js 14+ (App Router)",
vue   → "Vue 3 + Composition API",  vite → "Vite",
turbo → "Turborepo",  prisma → "Prisma ORM"
```

### 1.3 检测已有 AI 配置

```bash
for f in CLAUDE.md AGENTS.md STACK_ARCHITECTURE.md DESIGN.md .claude .codex .cursor; do
  [ -e "$f" ] && echo "exists: $f" || echo "missing: $f"
done
```

---

## 2. 通用冲突处理策略

对每个已存在的文件：

```
[m] merge    — 追加新内容，<!-- fe-set-ai-base: 追加于 YYYY-MM-DD --> 标记
[s] skip     — 跳过，保持现有不变（默认）
[r] replace  — 备份为 <file>.<timestamp>.bak，写入新内容
[a] abort    — 中止整个流程
```

---

## 3. 各文件生成

按以下顺序逐个处理。

### 3.1 CLAUDE.md

项目级 AI 指令文件，作为 AI 理解项目的入口。包含项目介绍、技术栈、命令、规范约束等，同时引用 AGENTS.md（AI 协作规范）和 STACK_ARCHITECTURE.md（技术架构），三者形成互补。

填充来源：

| 字段 | 来源 |
|:-----|:-----|
| Project | `package.json#name` + `#description` |
| Tech Stack | 依赖检测结果 |
| Commands | `package.json#scripts`（build/dev/test/lint） |
| Structure | `ls` 目录结构快照 |
| Conventions | lint 配置 + 常见命名约定 |

CLAUDE.md 可直接引用 AGENTS.md 内容（如安全边界、编码规范等），避免重复；技术架构相关内容则引用 STACK_ARCHITECTURE.md。

参考模板：`reference/CLAUDE.md.template`

### 3.2 AGENTS.md

AI 协作规范，跨工具通用。参考模板：`reference/AGENTS.md.template`

与 `fe-setup-basic-project-env` 的关系：如果项目已有 AGENTS.md（来自该 skill），merge 模式仅在末尾追加 AI 工具专属条目（Memory 管理、工具限制），不重复覆盖已有内容。

### 3.3 STACK_ARCHITECTURE.md

技术架构文档，含 ADR（架构决策记录）。参考模板：`reference/STACK_ARCHITECTURE.md.template`

生成策略：AI 填充检测到的目录结构、依赖、环境变量，架构描述部分标记为待人工完善。

### 3.4 DESIGN.md

UI 设计与交互规范文档。参考模板：`reference/DESIGN.md.template`

包含：设计系统、组件规范、交互模式、视觉风格、无障碍要求等。AI 根据项目技术栈（如 Tailwind/Unocss 等 CSS 方案、UI 组件库）生成初始内容，标记为待设计团队补充。

### 3.5 .claude/

```
.claude/
├── settings.json       # 项目级 Laude Code 设置（参考 reference/claude-settings.json）
└── memory/
    └── MEMORY.md       # 记忆索引（参考 reference/memory-MEMORY.md）
```

初始化命令：

```bash
mkdir -p .claude/memory
# 基于 reference/claude-settings.json 写入 settings.json
# 基于 reference/memory-MEMORY.md 写入 memory/MEMORY.md
```

---

## 4. 按需配置

### 4.1 .codex/

参考 `reference/codex-settings.json`。推荐引用 `.claude/settings.json` 而非重复配置。

```bash
mkdir -p .codex
```

### 4.2 .cursor/

参考 `reference/cursor-rule.mdc`。

```bash
mkdir -p .cursor/rules
```

---

## 5. 执行流程总结

```
1. cd <target-project>
2. 探测项目信息（package.json / 技术栈 / 已有 AI 配置）
3. 逐个处理（每个文件独立走冲突处理）：
   ├── CLAUDE.md            ← 填充探测结果（引用 AGENTS.md + STACK_ARCHITECTURE.md）
   ├── AGENTS.md            ← AI 协作规范（与 CLAUDE.md 互补）
   ├── STACK_ARCHITECTURE.md ← 技术架构文档
   ├── DESIGN.md            ← UI 设计与交互规范
   └── .claude/             ← settings.json + memory/
4. 可选：.codex/ .cursor/
5. 验证
6. 建议提交：git commit -m "chore: initialize AI engineering configuration"
```

---

## 6. 验证清单

```bash
for f in CLAUDE.md AGENTS.md STACK_ARCHITECTURE.md DESIGN.md; do
  [ -f "$f" ] && echo "  ✅ $f ($(wc -l < "$f") 行)" || echo "  ⬜ $f 未创建"
done
if [ -d .claude ]; then
  [ -f .claude/settings.json ] && echo "  ✅ .claude/settings.json"
  [ -f .claude/memory/MEMORY.md ] && echo "  ✅ .claude/memory/MEMORY.md"
fi
```

### 代码审查检查项

- [ ] 项目探测是否准确（技术栈、scripts、包管理器）
- [ ] CLAUDE.md 命令是否可执行（来源于实际 scripts）
- [ ] AGENTS.md 是否覆盖安全边界
- [ ] STACK_ARCHITECTURE.md 是否包含 ADR 记录
- [ ] DESIGN.md 是否覆盖 UI 设计规范
- [ ] .claude/memory/MEMORY.md 是否已创建
- [ ] 冲突处理策略是否正确执行
- [ ] 是否提交 `.claude/` 到版本控制
