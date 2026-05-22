# FE Skills

前端开发 Skills 集合，兼容 [Vercel Labs Skills CLI](https://github.com/vercel-labs/skills)。安装后可在 Claude Code、Cursor 等 50+ AI Agent 工具中使用。

## 前提条件

- **Node.js >= 18**（推荐 20+）
- **npx**（随 Node.js 一起安装）

## 安装

### 局部安装（当前项目）

在项目根目录执行：

```bash
npx skills add Jsmond2016/fe-skills
```

这会在当前项目下创建 `.skills` 目录，Skill 仅在该项目中可用。

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

## Available Skills

| Skill | Description |
|-------|-------------|
| [fe-code-review](./skills/fe-code-review) | 系统性代码审查，覆盖架构、质量、错误处理、性能、安全、测试 |
| [fe-commit](./skills/fe-commit) | Commit 提交规范与 Changelog 生成 |
| [fe-fullstack-dev](./skills/fe-fullstack-dev) | Full Stack Monorepo 全栈开发最佳实践 |
| [fe-node-dev-stack](./skills/fe-node-dev-stack) | Node.js 开发栈实践 |
| [fe-project-manager](./skills/fe-project-manager) | 项目管理与项目状态报告 |
| [fe-react-dev-stack](./skills/fe-react-dev-stack) | React + TypeScript 脚手架与开发最佳实践（Vite + antd + ahooks + Zustand/Jotai + TailwindCSS + Ramda 可选） |
| [fe-tailwindcss](./skills/fe-tailwindcss) | TailwindCSS 开发指南 |
| [sys-port-manager](./skills/sys-port-manager) | 跨平台端口管理工具（macOS/Linux），portctl CLI |
| [fe-set-ai-base](./skills/fe-set-ai-base) | AI 工程化配置初始化（CLAUDE.md + AGENTS.md + DESIGN.md + .claude/） |
| [fe-setup-basic-project-env](./skills/fe-setup-basic-project-env) | 通用项目基础环境配置（pnpm + ESLint + Prettier + AGENTS.md） |
| [fe-setup-vsc-config-plugin](./skills/fe-setup-vsc-config-plugin) | VS Code 扩展工程化配置（ESLint + Prettier + Husky + CI 打包） |

## 依赖管理（管理第三方 Skill）

本仓库支持像 npm 一样管理第三方的 Skill，可以方便地从 GitHub 安装和更新社区 Skill。

```bash
# 安装一个外部 skill（从多 skill 仓库中选一个）
npm run add-skill antfu/skills@vue

# 安装单 skill 仓库的所有 skill
npm run add-skill chen8254d/antd-skills

# 安装多 skill 仓库的所有 skill
npm run add-skill antfu/skills

# 查看已安装的 vendor skill 状态
npm run skill-status

# 更新所有 vendor skill 到最新版本
npm run update-skills

# 移除一个 vendor skill
npm run remove-skill vue
```

安装的第三方 skill 存放在 `skills/<name>/` 目录下，附带的 `GENERATION.md` 记录来源和版本信息，方便追溯和更新。

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
├── skills/                  # Skill 集合
│   ├── fe-react-stack/
│   │   └── SKILL.md
│   ├── fe-tailwindcss/
│   │   └── SKILL.md
│   └── ...
├── templates/               # 脚手架模板
├── scripts/                 # 工具脚本
│   ├── add-skill.js         # 安装外部 skill
│   ├── update-skills.js     # 更新所有 vendor skill
│   ├── remove-skill.js      # 移除 vendor skill
│   ├── skill-status.js      # 查看 vendor skill 状态
│   ├── create-skill.js
│   └── validate-skills.js
├── .claude/                 # Claude Code 配置
├── .github/                 # GitHub 配置
└── package.json
```

## 贡献

欢迎提交 PR！请阅读 [Contributing Guide](./.github/CONTRIBUTING.md)。

## License

[MIT](./LICENSE)
