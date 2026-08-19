# Contributing Guide

感谢你对 fe-skills 项目的贡献！

## 目录

- [如何创建新 Skill](#如何创建新-skill)
- [Skill 编写规范](#skill-编写规范)
- [本地验证](#本地验证)
- [提交 PR](#提交-pr)

## 如何创建新 Skill

### 方式一：使用脚手架（推荐）

```bash
# 交互式创建
npm run create-skill

# 命令行参数创建
npm run create-skill -- --name my-skill --description "My skill description"
```

脚手架会自动：
- 校验 skill 名称格式
- 创建 `skills/<name>/SKILL.md` 文件
- 从模板填充 YAML frontmatter

### 方式二：手动创建

1. 在 `skills/` 目录下创建新目录：
   ```bash
   mkdir skills/my-skill
   ```

2. 创建 `SKILL.md` 文件，必须包含 YAML frontmatter：
   ```markdown
   ---
   name: my-skill
   description: Brief description of what this skill does
   ---

   # My Skill

   <!-- Skill instructions here -->
   ```

3. 确保目录名与 frontmatter 中的 `name` 完全一致

### 导入开源 Skill

如果 skill 来自外部仓库，建议按下面的顺序处理：

1. 先把来源信息记录到 [CATALOG.md](../CATALOG.md)
2. 保留 `ORIGINAL.md` 和 `GENERATION.md`
3. 如需多平台适配，再生成 `adapters/`
4. 再决定是否做本地定制，避免丢失上游出处

## Skill 编写规范

### YAML Frontmatter（必填）

```yaml
---
name: skill-name           # 必填，小写字母、数字、连字符
description: Description   # 必填，简洁描述 skill 用途
---
```

- `name`：唯一标识符，只能包含小写字母、数字和连字符（`-`）
- `description`：一句话描述 skill 的功能和使用场景

### 目录结构

```
skills/
└── my-skill/          # 目录名必须与 frontmatter 中的 name 一致
    └── SKILL.md       # 文件名必须为大写的 SKILL.md
```

### 内容编写建议

- 使用清晰的 Markdown 格式
- 提供具体的代码示例
- 列出明确的规范和最佳实践
- 可以使用 checklist 方便代码审查时参考

## 本地验证

在提交 PR 前，请运行验证脚本：

```bash
npm run validate
```

验证脚本会检查：
- SKILL.md 文件是否存在
- YAML frontmatter 是否完整
- `name` 和 `description` 字段是否存在
- 目录名与 skill name 是否一致
- name 格式是否符合规范

如果验证失败，请根据错误提示修复后再提交。

## 提交 PR

1. Fork 本仓库并创建新分支
2. 按照上述规范创建或修改 skill
3. 运行 `npm run validate` 确保通过验证
4. 提交 PR，并填写 PR 模板中的 checklist
5. 等待 CI 通过和代码审查
