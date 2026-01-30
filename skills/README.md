# 个人 Skills

这个目录包含个人自定义的 skill。

## 当前 Skills

### react-stack

React 全栈开发最佳实践，整合了以下技术栈：
- React 18+ (函数组件 + Hooks)
- ahooks (React Hooks 库)
- Ant Design (UI 组件库)
- TailwindCSS (样式框架)
- Ramda (函数式编程)
- Jotai (状态管理)
- TypeScript (类型系统)

### tailwindcss

TailwindCSS 开发指南，包含：
- 安装与配置
- 常用工具类
- 与 Ant Design 集成
- 最佳实践

## 添加新 Skill

1. 在此目录创建新文件夹，例如 `my-skill/`
2. 创建 `SKILL.md` 文件，包含 skill 的完整内容
3. 确保 `SKILL.md` 文件包含正确的 frontmatter：
   ```yaml
   ---
   name: skill-name
   description: Skill 描述
   ---
   ```
4. （可选）更新 `skill-config.json` 添加配置
5. 运行 `../install.sh` 安装

## Skill 文件结构

每个 skill 目录应该包含：

```
skill-name/
├── SKILL.md          # 必需：skill 主文件
└── references/       # 可选：参考文档
    └── ...
```

## 注意事项

- Skill 名称应该使用小写字母和连字符（kebab-case）
- `SKILL.md` 文件名大小写敏感
- 保持 skill 内容简洁，详细内容可以放在 `references/` 目录
