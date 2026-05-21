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
| [fe-react-dev-stack](./skills/fe-react-dev-stack) | React Dev Stack 开发规范（路由、状态管理、Hooks、UI、CSS、代码质量） |
| [fe-react-stack](./skills/fe-react-stack) | React 全栈开发助手（React + ahooks + antd + TailwindCSS + Jotai + Ramda） |
| [fe-tailwindcss](./skills/fe-tailwindcss) | TailwindCSS 开发指南 |
| [sys-port-manager](./skills/sys-port-manager) | 跨平台端口管理工具（macOS/Linux），portctl CLI |
| [fe-set-ai-base](./skills/fe-set-ai-base) | AI 工程化配置初始化（CLAUDE.md + AGENTS.md + DESIGN.md + .claude/） |
| [fe-setup-basic-project-env](./skills/fe-setup-basic-project-env) | 通用项目基础环境配置（pnpm + ESLint + Prettier + AGENTS.md） |
| [fe-setup-vsc-config-plugin](./skills/fe-setup-vsc-config-plugin) | VS Code 扩展工程化配置（ESLint + Prettier + Husky + CI 打包） |

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
├── skills/              # Skill 集合
│   ├── fe-react-stack/
│   │   └── SKILL.md
│   ├── fe-tailwindcss/
│   │   └── SKILL.md
│   └── ...
├── templates/           # 脚手架模板
├── scripts/             # 工具脚本
│   ├── create-skill.js
│   └── validate-skills.js
├── .claude/             # Claude Code 配置
├── .github/             # GitHub 配置
└── package.json
```

## 贡献

欢迎提交 PR！请阅读 [Contributing Guide](./.github/CONTRIBUTING.md)。

## License

[MIT](./LICENSE)
