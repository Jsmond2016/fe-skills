# Skill Catalog

这个仓库按“平铺 `skills/` 目录 + 明确来源记录”的方式维护。`skills/` 保持兼容现有 CLI；`CATALOG.md` 负责说明每个 skill 的归属、来源和维护方式。

## 约定

- `自研`：本地维护的 skill，直接编辑 `SKILL.md` 和相关资源
- `工具`：用于管理仓库或平台同步的 skill
- `第三方`：从开源仓库导入的 skill，保留 `ORIGINAL.md` 和 `GENERATION.md`

## 目录索引

| Skill | 类别 | 来源 | 维护方式 | 说明 |
|---|---|---|---|---|
| `fe-chrome-ext-store-pre-publish` | 自研 | 本地维护 | 直接编辑 `skills/fe-chrome-ext-store-pre-publish/` | Chrome 扩展商店发布全流程 |
| `fe-skills-init` | 自研 | 本地维护 | 直接编辑 `skills/fe-skills-init/` | AI 工程化配置初始化 |
| `fe-code-review` | 自研 | 本地维护 | 直接编辑 `skills/fe-code-review/` | 代码审查规范 |
| `fe-commit` | 自研 | 本地维护 | 直接编辑 `skills/fe-commit/` | Commit 与 Changelog 规范 |
| `fe-dev-with-doc` | 自研 | 本地维护 | 直接编辑 `skills/fe-dev-with-doc/` | 按文档驱动开发 |
| `fe-dev-update-doc-by-commit` | 自研 | 本地维护 | 直接编辑 `skills/fe-dev-update-doc-by-commit/` | 按提交回补文档 |
| `fe-doc-format` | 自研 | 本地维护 | 直接编辑 `skills/fe-doc-format/` | 文档编写规范 |
| `fe-docs-summary` | 自研 | 本地维护 | 直接编辑 `skills/fe-docs-summary/` | 过程总结与沉淀 |
| `fe-fullstack-dev` | 自研 | 本地维护 | 直接编辑 `skills/fe-fullstack-dev/` | 全栈开发最佳实践 |
| `fe-large-file-refactor` | 自研 | 本地维护 | 直接编辑 `skills/fe-large-file-refactor/` | 大文件重构 |
| `fe-node-dev-stack` | 自研 | 本地维护 | 直接编辑 `skills/fe-node-dev-stack/` | Node.js 开发栈 |
| `fe-project-manager` | 自研 | 本地维护 | 直接编辑 `skills/fe-project-manager/` | 项目管理与状态报告 |
| `fe-react-dev-stack` | 自研 | 本地维护 | 直接编辑 `skills/fe-react-dev-stack/` | React + TypeScript 开发栈 |
| `fe-set-ai-base` | 自研 | 本地维护 | 直接编辑 `skills/fe-set-ai-base/` | AI 协作基础配置初始化 |
| `fe-setup-basic-project-env` | 自研 | 本地维护 | 直接编辑 `skills/fe-setup-basic-project-env/` | 通用项目基础环境配置 |
| `fe-setup-vsc-config-plugin` | 自研 | 本地维护 | 直接编辑 `skills/fe-setup-vsc-config-plugin/` | VS Code 扩展工程化配置 |
| `fe-tailwindcss` | 自研 | 本地维护 | 直接编辑 `skills/fe-tailwindcss/` | TailwindCSS 指南 |
| `sync-agent-skills` | 工具 | 本地维护 | 直接编辑 `skills/sync-agent-skills/` | 平台目录同步工具 |
| `sys-port-manager` | 工具 | 本地维护 | 直接编辑 `skills/sys-port-manager/` | 跨平台端口管理工具 |
| `code-simplifier` | 第三方 | `anthropics/claude-plugins-official` | 保留 `ORIGINAL.md` + `GENERATION.md`，必要时同步 adapters | 代码简化与重构 |
| `diagnose` | 第三方 | `mattpocock/skills` | 保留 `ORIGINAL.md` + `GENERATION.md`，必要时同步 adapters | 硬 Bug 与性能诊断 |
| `frontend-design` | 第三方 | `anthropics/skills` | 保留 `ORIGINAL.md` + `GENERATION.md`，必要时同步 adapters | 高品质前端界面设计 |
| `grill-me` | 第三方 | `mattpocock/skills` | 保留 `ORIGINAL.md` + `GENERATION.md`，必要时同步 adapters | 追问式讨论与方案校验 |
| `grill-with-docs` | 第三方 | `mattpocock/skills` | 保留 `ORIGINAL.md` + `GENERATION.md`，必要时同步 adapters | 结合文档的批判性讨论 |
| `tdd` | 第三方 | `mattpocock/skills` | 保留 `ORIGINAL.md` + `GENERATION.md`，必要时同步 adapters | 测试驱动开发 |
| `to-issues` | 第三方 | `mattpocock/skills` | 保留 `ORIGINAL.md` + `GENERATION.md`，必要时同步 adapters | 计划拆解为 Issues |
| `write-a-skill` | 第三方 | `mattpocock/skills` | 保留 `ORIGINAL.md` + `GENERATION.md`，必要时同步 adapters | 创建符合结构的 skill |

## 维护规则

1. 新增自研 skill 时，先放进 `skills/<name>/`，再更新 `README.md` 和本文件。
2. 导入第三方 skill 时，保留来源原文和生成记录，不要只留一份清洗后的 `SKILL.md`。
3. 需要适配 Cursor、Copilot 等平台时，只提交生成物，不把生成逻辑混进正文。
4. 如果 skill 来源或归属变化，先改 `CATALOG.md`，再改脚本或文档。
