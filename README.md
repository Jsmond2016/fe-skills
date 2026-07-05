# FE Skills

前端开发 Skills 集合，兼容 [Vercel Labs Skills CLI](https://github.com/vercel-labs/skills)。安装后可在 Claude Code、Cursor 等 50+ AI Agent 工具中使用。

## 前提条件

- **Node.js >= 18**（推荐 20+）
- **npx**（随 Node.js 一起安装）

## 安装

### 局部安装（当前项目）

在项目根目录执行：

```bash
npx skills add Jsmond2016/fe-skills --all
```

这会在当前项目下创建 `.agents/skills` 目录，Skill 仅在该项目中可用。

### 安装后的同步

`npx skills add` 将 skills 安装到 `.agents/skills/` 目录，但 Claude Code 识别 `.claude/skills/`，Codex 识别 `.codex/skills/`。安装完成后，执行同步脚本一键链接到各 AI 平台目录：

```bash
node .agents/skills/sync-agent-skills/scripts/sync.cjs
```

该脚本会自动创建 `.claude/skills/` 和 `.codex/skills/`（如不存在），并为所有 skill 创建 symlink。

### 全局安装（所有项目）

#### 方式一：使用 npx skills CLI

```bash
npx skills add --global Jsmond2016/fe-skills
```

这会安装到 `~/.skills/` 目录，所有项目均可使用。

#### 方式二：手动配置

```bash
# 1. 克隆仓库
git clone https://github.com/Jsmond2016/fe-skills.git ~/.skills/fe-skills

# 2. 在 Claude Code 全局配置中添加 skills 路径
# 编辑 ~/.claude/settings.json，添加：
```

```json
{
  "skills": {
    "paths": ["~/.skills/fe-skills/skills"]
  }
}
```

> **Cursor 用户**：在 Cursor 的设置中配置 Skills Path（设置路径 -> Features -> Skills Path），指向 `~/.skills/fe-skills/skills`。

## 更新

安装后，当 `fe-skills` 仓库有新增或改进的 skill 时，可按以下方式更新。

### 局部更新（当前项目）

```bash
# 更新所有已安装的 project-level skills
npx skills update -y

# 更新指定的 skill（用 skill 名，而非包名）
npx skills update fe-code-review fe-commit -y
```

`npx skills update` 会读取 `skills-lock.json`，找到各 skill 的来源仓库，从 GitHub 拉取最新版本后重新安装。

### 覆盖重装

```bash
# 重新拉取并覆盖安装所有 skill（等价于"删除→重装"一步完成）
npx skills add Jsmond2016/fe-skills --all -y
```

### 全局更新

```bash
npx skills update -g -y
```

### 本地开发场景

如果你同时在本机开发 `fe-skills`（改动尚未 push），用本地路径安装后覆盖重装：

```bash
# 第一次安装：使用本地路径
npx skills add /Users/huangjin/Desktop/github/fe-skills -y --all

# fe-skills 有本地修改后，重新覆盖安装
npx skills add /Users/huangjin/Desktop/github/fe-skills -y --all
```

> **注意**：`npx skills update` 从 GitHub 拉取最新版，本地未 push 的改动不会被包含。本地开发阶段建议用上面的路径覆盖方式。

## Available Skills

| Skill | Description |
|-------|-------------|
| [fe-chrome-ext-store-pre-publish](./skills/fe-chrome-ext-store-pre-publish) | Chrome 扩展商店发布全流程（CWS + Edge Add-ons） |
| [fe-code-review](./skills/fe-code-review) | 系统性代码审查，覆盖架构、质量、错误处理、性能、安全、测试 |
| [fe-commit](./skills/fe-commit) | Commit 提交规范与 Changelog 生成 |
| [fe-doc-format](./skills/fe-doc-format) | 文档编写规范化（需求/技术/接口/项目文档） |
| [fe-fullstack-dev](./skills/fe-fullstack-dev) | Full Stack Monorepo 全栈开发最佳实践 |
| [fe-large-file-refactor](./skills/fe-large-file-refactor) | 大文件自动检测与重构（JS/TS/Vue，超 450 行触发） |
| [fe-node-dev-stack](./skills/fe-node-dev-stack) | Node.js 开发栈实践 |
| [fe-project-manager](./skills/fe-project-manager) | 项目管理与项目状态报告 |
| [fe-react-dev-stack](./skills/fe-react-dev-stack) | React + TypeScript 脚手架与开发最佳实践（Vite + antd + ahooks + Zustand/Jotai + TailwindCSS + Ramda 可选） |
| [fe-set-ai-base](./skills/fe-set-ai-base) | AI 工程化配置初始化（CLAUDE.md + AGENTS.md + DESIGN.md + .claude/） |
| [fe-setup-basic-project-env](./skills/fe-setup-basic-project-env) | 通用项目基础环境配置（pnpm + ESLint + Prettier + AGENTS.md） |
| [fe-setup-vsc-config-plugin](./skills/fe-setup-vsc-config-plugin) | VS Code 扩展工程化配置（ESLint + Prettier + Husky + CI 打包）|
| [fe-tailwindcss](./skills/fe-tailwindcss) | TailwindCSS 开发指南 |
| [sync-agent-skills](./skills/sync-agent-skills) | 将 `.agents/skills/` 中已安装的 skills 同步到 `.claude/skills/`、`.codex/skills/` |
| [sys-port-manager](./skills/sys-port-manager) | 跨平台端口管理工具（macOS/Linux），portctl CLI |

> 第三方 Skill（通过 `npm run add-skill` 安装）
>
> | Skill | Source | Description |
> |-------|--------|-------------|
> | [code-simplifier](./skills/code-simplifier) | anthropic/claude-plugins-official | 代码简化与重构，提升可读性和可维护性 |
> | [diagnose](./skills/diagnose) | mattpocock/skills | 硬 Bug 与性能回归的规范化诊断循环 |
> | [frontend-design](./skills/frontend-design) | anthropics/skills | 创建高品质前端界面，避免 AI 同质化审美 |
> | [grill-me](./skills/grill-me) | mattpocock/skills | 对计划/设计进行追问式讨论，直至达成共识 |
> | [grill-with-docs](./skills/grill-with-docs) | mattpocock/skills | 结合领域模型的批判性讨论，联动文档更新 |
> | [tdd](./skills/tdd) | mattpocock/skills | 测试驱动开发（红-绿-重构循环） |
> | [to-issues](./skills/to-issues) | mattpocock/skills | 将计划/PRD 拆解为可独立领取的 Issue |
> | [write-a-skill](./skills/write-a-skill) | mattpocock/skills | 创建符合结构的 Agent Skill |

## 依赖管理（管理第三方 Skill）

本仓库支持像 npm 一样管理第三方的 Skill，支持从 GitHub 仓库或任意 URL 安装。

```bash
# 从 GitHub 多 skill 仓库安装
npm run add-skill antfu/skills@vue           # 安装单个 skill
npm run add-skill antfu/skills               # 安装全部 skill

# 从单 skill 仓库安装
npm run add-skill chen8254d/antd-skills

# 从任意 URL 安装（自动适配多模型）
npm run add-skill https://github.com/org/repo/blob/main/path/to/skill.md

# 指定名称安装（URL 源无法自动识别名称时）
npm run add-skill <url> --name my-skill

# 管理
npm run skill-status                          # 查看 vendor skill 状态
npm run update-skills                         # 更新所有 vendor skill
npm run remove-skill vue                      # 移除 vendor skill

# 转换为其他 AI 平台格式
npm run convert-skill code-simplifier         # 查看 adapter 状态
npm run convert-skill code-simplifier --platform all   # 生成所有平台适配器
```

### 多模型适配

从 URL 安装的 skill 会自动生成**多平台适配器**，存放在 `skills/<name>/adapters/` 下：

| 适配器 | 目标平台 | 使用方式 |
|--------|---------|---------|
| `cursor.mdc` | Cursor IDE | 复制到 `.cursor/rules/<name>.mdc` |
| `cursor.cursorrules` | Cursor (legacy) / Windsurf | 复制到项目根目录 `.cursorrules` |
| `copilot.md` | GitHub Copilot | 复制到 `.github/copilot-instructions.md` |

同时会保留：
- `SKILL.md` — 清理后的跨平台格式（已移除 `model:` 等专有字段）
- `ORIGINAL.md` — 原始内容备份
- `GENERATION.md` — 来源跟踪

## 开发

### 创建新 Skill

```bash
# 交互式创建
npm run create-skill

# 命令行参数创建
npm run create-skill -- --name my-skill --description "My skill description"

# 指定目录名（可选，默认与 name 一致）
npm run create-skill -- --name my-skill --dir my-skill --description "My skill description"
```

### 验证 Skill 格式

```bash
npm run validate
```

## 项目结构

```
fe-skills/
├── skill-dependencies.json  # Vendor skill 依赖 manifest（自动维护）
├── skills/                  # Skill 集合（23 个）
│   ├── fe-*/                # 前端自有 skill（fe-code-review、fe-commit 等 13 个）
│   ├── sync-agent-skills/   # 工具 skill：.agents/ → AI 平台目录同步
│   │   ├── SKILL.md
│   │   └── scripts/
│   │       └── sync.cjs
│   ├── sys-port-manager/    # 系统工具 skill
│   └── diagnose/            # 第三方 skill（通过 URL 导入，共 8 个）
│       ├── SKILL.md         #   清洗后的跨平台格式
│       ├── ORIGINAL.md      #   原始内容备份
│       ├── GENERATION.md    #   来源跟踪
│       └── adapters/        #   多平台适配器
│           ├── cursor.mdc
│           ├── cursor.cursorrules
│           └── copilot.md
├── templates/               # 脚手架模板
├── scripts/                 # 工具脚本
│   ├── add-skill.js         # 安装外部 skill（支持 GitHub / URL）
│   ├── update-skills.js     # 更新所有 vendor skill
│   ├── convert-skill.js     # 转换 skill 到其他 AI 平台格式
│   ├── remove-skill.js      # 移除 vendor skill
│   ├── skill-status.js      # 查看 vendor skill 状态
│   ├── create-skill.js
│   └── validate-skills.js
├── .claude/                 # Claude Code 配置
├── .github/                 # GitHub 配置
└── package.json
```

## 常见问题 (FAQ)

### `npx skills update` 提示 "No project skills to update"

**原因**：当前项目从未安装过 skills，或 `skills-lock.json` / `.agents/skills/` 已被删除。`update` 需要读取 `skills-lock.json` 来确定已安装的 skill 列表及其来源仓库。

**解决**：先执行一次安装：

```bash
npx skills add Jsmond2016/fe-skills --all -y
```

后续即可使用 `npx skills update -y` 更新。

### `npx skills update Jsmond2016/fe-skills` 没有效果

**原因**：`update` 命令的参数是 **skill 名称**（如 `fe-code-review`、`fe-commit`），不是 **GitHub 包名**（如 `Jsmond2016/fe-skills`）。传入包名会被忽略。

```bash
# ✅ 正确：传 skill 名
npx skills update fe-code-review fe-commit -y

# ✅ 正确：不传参则更新全部
npx skills update -y

# ❌ 错误：不支持包名
npx skills update Jsmond2016/fe-skills -y
```

### `npx skills update` 没有拉取我本地的修改

**原因**：`npx skills update` 从 **GitHub** 拉取最新代码。如果你在本地修改了 `fe-skills` 仓库但尚未 `git push`，`update` 无法获取这些改动。

**解决**：本地开发阶段，改用本地路径覆盖安装：

```bash
npx skills add /Users/huangjin/Desktop/github/fe-skills -y --all
```

### 本地 skills 已删除，如何重新找回？

直接重新添加即可：

```bash
npx skills add Jsmond2016/fe-skills --all -y
```

这会重新从 GitHub 拉取所有 skill 并安装到 `.agents/skills/`。

### 如何查看当前安装的 skills？

```bash
# 查看项目级 skills
npx skills list

# 查看全局 skills
npx skills list -g

# JSON 格式输出（机器可读）
npx skills list --json

# 按 agent 过滤
npx skills list -a claude-code
```

### skills-lock.json 的作用是什么？

`skills-lock.json` 是 `npx skills` 自动维护的锁文件，记录每个已安装 skill 的名称、来源仓库、ref、安装路径等信息。`update` 命令依赖它来判断需要更新哪些 skill。

- 位于项目根目录（project-level）或 `~/.skills/`（global）
- 由 `npx skills add` 自动创建，`npx skills update` 自动更新
- **不应手动编辑**，但应纳入版本控制

## 贡献

欢迎提交 PR！请阅读 [Contributing Guide](./.github/CONTRIBUTING.md)。

## License

[MIT](./LICENSE)
