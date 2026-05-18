# FE Skills

前端开发 Skills 集合，兼容 [Vercel Labs Skills CLI](https://github.com/vercel-labs/skills)，支持通过 `npx skills add` 一键安装到 Claude Code、Cursor 等 50+ AI Agent 工具。

## 安装

```bash
npx skills add Jsmond2016/fe-skills
```

## Available Skills

| Skill | Description |
|-------|-------------|
| [react-stack](./skills/react-stack) | React 全栈开发最佳实践 |
| [tailwindcss](./skills/tailwindcss) | TailwindCSS 开发指南 |

## 开发

### 创建新 Skill

```bash
# 交互式创建
npm run create-skill

# 命令行参数创建
npm run create-skill -- --name my-skill --description "My skill description"
```

### 验证 Skill 格式

```bash
npm run validate
```

## 贡献

欢迎提交 PR！请阅读 [Contributing Guide](./.github/CONTRIBUTING.md)。

## License

[MIT](./LICENSE)
