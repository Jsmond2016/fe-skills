---
name: fe-commit
description: 代码提交规范 — 基于 Angular Commit Convention 的标准化提交，使用中文描述词。适用于所有 git 提交、代码变更记录、生成 CHANGELOG 的场景。
---

# Commit 提交规范

基于 Angular Commit Convention 的标准化 git 提交规范，使用中文描述变更内容。

## 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 示例

```
feat(user): 添加用户注册功能

实现邮箱验证码注册流程，包含表单校验和错误提示。
新增 useRegisterForm hook 处理注册逻辑。

Closes #123
```

```
fix(api): 修复用户列表接口分页参数错误

page 参数从 0 开始计数改为从 1 开始，与前端约定对齐。
```

```
refactor(components): 重构 Table 组件，提取 useSort hook
```

## Type 类型

使用 Angular 约定的 type 列表，**必须**使用英文 type + 中文描述：

| Type | 中文 | 说明 |
|:-----|:-----|:-----|
| feat | 特性 | 新功能、新特性 |
| fix | 修复 | Bug 修复 |
| docs | 文档 | 仅文档变更 |
| style | 样式 | 代码格式/样式变更（不影响逻辑） |
| refactor | 重构 | 代码重构（既非 feat 也非 fix） |
| perf | 性能 | 性能优化 |
| test | 测试 | 增加或修改测试 |
| build | 构建 | 构建系统或外部依赖变更 |
| ci | 集成 | CI 配置和脚本变更 |
| chore | 杂项 | 其他杂项（构建工具、辅助工具等） |
| revert | 回滚 | 回滚提交 |

## Scope 范围

可选的 scope 标识变更影响的范围：

| Scope | 适用场景 |
|:------|:---------|
| `user` | 用户模块 |
| `api` | 接口层 |
| `components` | 组件 |
| `pages` | 页面 |
| `hooks` | Hooks |
| `stores` | 状态管理 |
| `utils` | 工具函数 |
| `types` | 类型定义 |
| `styles` | 样式 |
| `deps` | 依赖 |
| `config` | 配置 |
| `router` | 路由 |
| `db` | 数据库 |

## 提交示例

### 特性与修复

```
feat: 添加用户头像上传功能

feat(auth): 集成 OAuth 微信登录

feat(api): 新增文章搜索接口

fix: 修复日期选择器在 Safari 下的显示异常

fix(api): 修复创建订单时库存不足未正确报错
```

### 重构与优化

```
refactor(components): 提取通用 Table 组件，减少重复代码

refactor(api): 统一错误处理中间件

perf: 优化列表渲染，虚拟滚动替代全量渲染

perf(api): 添加 Redis 缓存，减少数据库查询
```

### 样式与文档

```
style(components): 调整按钮组件的间距和颜色

style: 统一代码缩进为 2 空格

docs: 更新 API 接口文档

docs(readme): 添加本地开发步骤说明
```

### 工程化

```
build: 升级 Vite 5 并调整构建配置

build(deps): 升级 antd 到 5.15

ci: 添加 PR 自动检查工作流

chore: 配置 ESLint 规则
```

## 提交规范细则

### Subject（必填）

- 使用**中文**描述变更内容
- 不超过 50 个字符
- 祈使句、现在时（"添加" 而非 "添加了"）
- 结尾不加句号

```
✅ feat: 添加用户登录页面
❌ feat: Added user login page
❌ feat: 添加了用户登录页面。
❌ feat: add user login page.（应使用中文描述）
```

### Body（可选）

- 使用**中文**
- 说明变更的动机、对比前后的差异
- 每行不超过 72 个字符

### Footer（可选）

- **Breaking Changes**：以 `BREAKING CHANGE:` 开头
- **关联 Issue**：`Closes #123` / `Refs #456`

```
feat(api): 重构认证接口，改用 JWT 方案

BREAKING CHANGE: 不再支持 Session 认证方式，所有客户端需要更新 Token 获取逻辑。
Closes #89
```

## 禁止的提交信息

```
❌ 禁止：无意义的提交
fix: 111
sss
update

❌ 禁止：混合 type 描述
feat: fix bug and add feature

❌ 禁止：英文描述（与规范要求的 中文描述词 冲突）
feat: add user login page

❌ 禁止：过长的 subject
feat: 这是一个非常长的提交描述因为我想把所有内容都写在标题里这样是不对的
```

## 常见工作流

### 初始提交

```bash
git add .
git commit -m "feat: 初始化项目结构"
```

### 修复 Bug

```bash
git commit -m "fix(api): 修复分页查询总数不准确的问题"
```

### WIP 提交

不建议提交 WIP。如需临时保存，使用 stash 或 fixup：

```bash
# 临时保存工作区
git stash

# 或将变更追加到上一个提交
git add .
git commit --fixup HEAD
```

## CHANGELOG 生成

遵循此规范后，可使用 `conventional-changelog` 自动生成 CHANGELOG：

```bash
pnpm add -D conventional-changelog-cli

# 生成 CHANGELOG
npx conventional-changelog -p angular -i CHANGELOG.md -s

# 首次生成
npx conventional-changelog -p angular -i CHANGELOG.md -s -r 0
```

输出的 CHANGELOG 示例：

```markdown
# Changelog

## 1.0.0 (2025-06-01)

### Features
* 添加用户注册功能 ([abc1234](https://...))
* 集成微信登录 ([def5678](https://...))

### Bug Fixes
* 修复分页参数错误 ([ghi9012](https://...))

### Performance Improvements
* 优化列表渲染性能 ([jkl3456](https://...))
```

## 代码审查检查项

- [ ] type 是否正确（使用 Angular 约定的 11 种 type）
- [ ] subject 是否为中文描述
- [ ] subject 是否不超过 50 字符
- [ ] subject 是否以祈使句描述（"添加" 非 "添加了"）
- [ ] subject 结尾是否无句号
- [ ] 如果存在 breaking change，是否在 footer 中标注
- [ ] 如果关联 issue，是否在 footer 中引用
