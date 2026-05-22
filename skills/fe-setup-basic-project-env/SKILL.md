---
name: fe-setup-basic-project-env
description: 通用项目基础环境配置 — pnpm、ESLint、Prettier、Git、npm 镜像源、发版规范、CHANGELOG、AI 协作规范 Agents.md。适用于任何技术栈的项目初始化，提供无侵入、可叠加的"地基"配置。
---

# 通用项目基础环境配置 (fe-setup-basic-project-env)

为任何技术栈的项目提供一套无侵入、可叠加的基础环境配置。只关注"地基"，不绑定具体业务框架，其他技术栈 skill 在此基础上追加专属配置。

## 适用场景

- 新建项目，需要快速搭建基础工程化环境
- 现有项目缺少统一的基础规范，需要补全
- 需要引入 AI 协作规范（Agents.md），统一人机协作方式
- 多包仓库（Monorepo）需要统一包管理和基础配置

## 设计原则

1. **无侵入性**：基础配置，不绑定任何前端/后端框架
2. **可叠加性**：其他技术栈 skill（如 `fe-react-stack`、`fe-node-dev-stack`）在此基础上追加专属配置
3. **快速落地**：提供可直接复制使用的配置文件模板
4. **AI 友好**：内置 Agents.md 规范，让人与 AI 的协作有章可循

---

## 配置概览

| 模块 | 说明 | 相关文件 |
|:-----|:-----|:---------|
| 包管理器 | 统一 pnpm，Monorepo 使用 workspaces | `pnpm-workspace.yaml` |
| 镜像源 | 淘宝镜像，团队内一致 | `.npmrc` |
| Node 版本 | 锁定开发 Node 版本 | `.nvmrc`, `package.json#engines` |
| Git 基础 | 忽略规则、分支策略 | `.gitignore` |
| 编辑器统一 | 跨 IDE 一致的基础行为 | `.editorconfig` |
| 代码规范（基础） | ESLint + Prettier 通用配置 | `.eslintrc.cjs`, `.prettierrc` |
| 环境变量 | 统一环境变量管理规范 | `.env.example` |
| 发版规范 | SemVer + Git Tag + 发布检查清单 | `scripts/release.cjs` |
| CHANGELOG | 格式规范与生成指引 | 文档说明（生成交由 `fe-commit`） |
| CI/CD | GitHub Actions 自动发版：检测 release commit → 构建 → 打包 → 创建 Release | `.github/workflows/release.yml` |
| AI 协作规范 | 人机协作的行为准则与边界 | `AGENTS.md` |

---

## 1. 包管理器：pnpm

### 1.1 单项目配置

确保项目使用 `pnpm`：

```bash
# 查看当前包管理器
ls -la | grep pnpm-lock

# 如未使用 pnpm，迁移
npm install -g pnpm
rm -f package-lock.json yarn.lock
pnpm install
```

### 1.2 Monorepo 配置

若项目包含多个包（如 `packages/*`、`apps/*`），启用 pnpm workspaces：

**文件**：`pnpm-workspace.yaml`

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

**目录结构示例**：

```
my-project/
├── packages/
│   ├── ui/
│   └── utils/
├── apps/
│   ├── web/
│   └── api/
├── package.json          # root package.json
└── pnpm-workspace.yaml
```

**Root `package.json` 建议**：

```json
{
  "name": "my-project",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "build": "pnpm -r build",
    "dev": "pnpm -r dev",
    "lint": "pnpm -r lint",
    "test": "pnpm -r test"
  }
}
```

---

## 2. 镜像源配置

**文件**：`.npmrc`

```ini
# 默认使用淘宝镜像，加速国内安装
registry=https://registry.npmmirror.com

# 如需切换官方源，注释上一行，取消下一行注释
# registry=https://registry.npmjs.org

# 严格锁定依赖版本（推荐）
engine-strict=true
```

> 提交到仓库后，项目中执行 `pnpm install` 均走统一配置；CI 使用同一配置，确保环境一致性。

---

## 3. Node 版本约束

**文件**：`.nvmrc`

```
20
```

**`package.json` 中添加**：

```json
{
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

> 团队成员使用 `nvm use` 自动切换正确版本；CI 中根据 `.nvmrc` 安装对应 Node 版本。

---

## 4. Git 基础配置

### 4.1 .gitignore 模板

**文件**：`.gitignore`

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
out/
*.tsbuildinfo

# Environment variables
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*
pnpm-debug.log*

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
*.tmp
```

### 4.2 分支策略

推荐采用 **Git Flow 简化版**：

| 分支 | 用途 | 保护规则 |
|:-----|:-----|:---------|
| `main` | 生产分支，只接受合并请求 | 禁止直接 push，需 PR + 审查 |
| `develop` | 开发分支，功能集成 | 禁止直接 push，需 PR |
| `feature/*` | 新功能开发 | 从 develop 切出，合并回 develop |
| `fix/*` | Bug 修复 | 从 develop 切出，合并回 develop |
| `hotfix/*` | 生产环境紧急修复 | 从 main 切出，合并回 main + develop |
| `release/*` | 发版准备 | 从 develop 切出，合并回 main |

---

## 5. EditorConfig

**文件**：`.editorconfig`

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2
max_line_length = 100

[*.{md,mdx}]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
```

---

## 6. 代码规范：ESLint + Prettier（基础版）

> 此为**通用基础配置**，不绑定 React/Vue/Node 等具体规则。各技术栈 skill 在此基础上扩展。

### 6.1 依赖安装

```bash
pnpm add -D eslint prettier eslint-config-prettier
```

### 6.2 ESLint 基础配置

**文件**：`.eslintrc.cjs`

```javascript
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'prettier',
  ],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'warn',
    'prefer-const': 'error',
    'eqeqeq': ['error', 'always'],
  },
};
```

**文件**：`.eslintignore`

```
dist/
build/
out/
node_modules/
coverage/
*.min.js
CHANGELOG.md
```

### 6.3 Prettier 配置

**文件**：`.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "endOfLine": "lf"
}
```

**文件**：`.prettierignore`

```
dist/
build/
out/
node_modules/
coverage/
pnpm-lock.yaml
CHANGELOG.md
```

### 6.4 package.json scripts

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

---

## 7. 环境变量管理

### 7.1 .env.example 模板

**文件**：`.env.example`

```bash
# 数据库连接
# DATABASE_URL="mysql://user:password@localhost:3306/dbname"

# Redis 连接
# REDIS_URL="redis://localhost:6379"

# JWT 密钥
# JWT_SECRET="your-secret-key"

# API 基础地址
# API_BASE_URL="http://localhost:3000"

# 端口号
# PORT=3000

# 运行环境
# NODE_ENV=development
```

### 7.2 使用规范

- `.env.example` 必须提交到仓库，作为环境变量清单
- `.env`、`.env.local` 必须加入 `.gitignore`，禁止提交真实配置
- 新增环境变量时，同步更新 `.env.example` 和项目文档
- 敏感信息（密码、Token、密钥）只能放在 `.env` 中，禁止硬编码

---

## 8. 发版规范

### 8.1 版本号管理

采用 [Semantic Versioning 2.0.0](https://semver.org/lang/zh-CN/)：

```
版本格式：主版本号.次版本号.修订号（MAJOR.MINOR.PATCH）

- MAJOR：不兼容的 API 修改
- MINOR：向下兼容的功能新增
- PATCH：向下兼容的问题修复
```

### 8.2 发布脚本

**文件**：`scripts/release.cjs`

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RELEASE_TYPES = ['patch', 'minor', 'major'];

function main() {
  const args = process.argv.slice(2);
  const type = args[0] || 'patch';
  const shouldPush = args.includes('--push') || args.includes('-p');

  if (!RELEASE_TYPES.includes(type)) {
    console.error(`Invalid release type: ${type}`);
    console.error(`Usage: node scripts/release.cjs [patch|minor|major] [--push]`);
    process.exit(1);
  }

  // 1. 检查工作区是否干净
  try {
    execSync('git diff --quiet', { stdio: 'ignore' });
  } catch {
    console.error('Error: Working directory is not clean. Please commit or stash changes first.');
    process.exit(1);
  }

  // 2. Bump version（不自动打 tag）
  execSync(`npm version ${type} --no-git-tag-version`, { stdio: 'inherit' });

  // 3. 读取新版本号
  const pkgPath = path.join(process.cwd(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const version = pkg.version;

  // 4. 生成 CHANGELOG（需已安装 conventional-changelog-cli）
  try {
    execSync(
      `npx conventional-changelog -p angular -i CHANGELOG.md -s -r 1`,
      { stdio: 'inherit' }
    );
  } catch {
    console.warn('CHANGELOG generation skipped or failed');
  }

  // 5. Git commit（本地 tag 仅用于标记，远端 tag 由 CI 自动创建）
  execSync('git add package.json CHANGELOG.md', { stdio: 'inherit' });
  execSync(`git commit -m "chore(release): ${version}"`, { stdio: 'inherit' });
  execSync(`git tag v${version}`, { stdio: 'inherit' });

  console.log(`\n✅ Release v${version} created locally.`);

  // 6. 推送（可选）
  // 注意：建议只推 commit，不推 --tags。
  // CI 会检测 chore(release): x.x.x 提交后自动创建远端 tag 和 GitHub Release。
  if (shouldPush) {
    execSync('git push', { stdio: 'inherit' });
    console.log('✅ Pushed to remote.');
    console.log('ℹ️  CI 将自动创建 tag 和 Release（检测到 release commit）。');
  } else {
    console.log('\nTo push commit (CI will auto-create tag and Release):');
    console.log('  git push');
  }
}

main();
```

### 8.3 package.json scripts

```json
{
  "scripts": {
    "release": "node scripts/release.cjs patch --push",
    "release:patch": "node scripts/release.cjs patch",
    "release:minor": "node scripts/release.cjs minor",
    "release:major": "node scripts/release.cjs major",
    "release:patch:push": "node scripts/release.cjs patch --push",
    "release:minor:push": "node scripts/release.cjs minor --push",
    "release:major:push": "node scripts/release.cjs major --push"
  }
}
```

### 8.4 发布检查清单

执行发版前，确认以下事项：

- [ ] 当前分支为 `main` 或 `release/*`
- [ ] 工作区干净，无未提交变更
- [ ] 所有 CI 检查通过
- [ ] 测试全部通过
- [ ] CHANGELOG 已更新（由脚本自动生成）
- [ ] 版本号符合 SemVer 规范
- [ ] 发版后验证生产环境正常

---

## 9. CHANGELOG 规范

CHANGELOG 由 `conventional-changelog` 根据 Conventional Commits 历史自动生成。

### 9.1 生成方式

```bash
# 安装依赖
pnpm add -D conventional-changelog-cli

# 首次生成（包含全部历史）
npx conventional-changelog -p angular -i CHANGELOG.md -s -r 0

# 后续发版时由 scripts/release.cjs 自动更新
```

### 9.2 格式要求

- 使用中文描述变更内容
- 按类型分组（Features / Bug Fixes / Performance Improvements 等）
- 每个条目包含 commit message 和对应 commit hash

> 提交规范必须遵循 `fe-commit` skill 的约定，否则不会出现在 CHANGELOG 中。

---

## 10. CI/CD：GitHub Actions 自动发版

### 10.1 工作流配置

**文件**：`.github/workflows/release.yml`

```yaml
name: Auto Release on Commit

# 触发条件：
# 1. 推送到 main 分支
# 2. commit 消息格式为 "chore(release): x.x.x"
on:
  push:
    branches: [ main ]
    paths-ignore:
      - 'README.md'
      - 'docs/**'
      - '*.md'

jobs:
  auto-release:
    name: Auto Release
    timeout-minutes: 20
    runs-on: ubuntu-latest
    permissions:
      contents: write
      packages: write

    steps:
      - name: Check out code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check commit message format
        id: check_commit
        run: |
          COMMIT_MSG=$(git log -1 --pretty=%B)
          echo "Latest commit message: $COMMIT_MSG"

          if [[ $COMMIT_MSG =~ ^chore\(release\):\ ([0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.-]+)?)$ ]]; then
            VERSION=${BASH_REMATCH[1]}
            echo "✅ Valid release commit detected: $VERSION"
            echo "version=$VERSION" >> $GITHUB_OUTPUT
            echo "tag_name=v$VERSION" >> $GITHUB_OUTPUT
            echo "should_release=true" >> $GITHUB_OUTPUT
          else
            echo "❌ Commit message does not match release format"
            echo "Expected format: chore(release): x.x.x"
            echo "should_release=false" >> $GITHUB_OUTPUT
          fi

      - name: Check if tag already exists
        if: steps.check_commit.outputs.should_release == 'true'
        id: check_tag
        run: |
          TAG_NAME="${{ steps.check_commit.outputs.tag_name }}"
          if git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
            echo "❌ Tag $TAG_NAME already exists"
            echo "tag_exists=true" >> $GITHUB_OUTPUT
          else
            echo "✅ Tag $TAG_NAME does not exist, proceeding with release"
            echo "tag_exists=false" >> $GITHUB_OUTPUT
          fi

      - name: Setup pnpm
        if: steps.check_commit.outputs.should_release == 'true' && steps.check_tag.outputs.tag_exists == 'false'
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js environment
        if: steps.check_commit.outputs.should_release == 'true' && steps.check_tag.outputs.tag_exists == 'false'
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        if: steps.check_commit.outputs.should_release == 'true' && steps.check_tag.outputs.tag_exists == 'false'
        run: pnpm install --frozen-lockfile

      - name: Build project
        if: steps.check_commit.outputs.should_release == 'true' && steps.check_tag.outputs.tag_exists == 'false'
        run: pnpm run build

      - name: Verify build outputs
        if: steps.check_commit.outputs.should_release == 'true' && steps.check_tag.outputs.tag_exists == 'false'
        run: |
          if [ ! -d "dist" ]; then
            echo "ERROR: dist directory not found"
            exit 1
          fi
          echo "✅ Build outputs verified"

      - name: Read Changelog from CHANGELOG.md
        if: steps.check_commit.outputs.should_release == 'true' && steps.check_tag.outputs.tag_exists == 'false'
        id: generate_changelog
        run: |
          VERSION="${{ steps.check_commit.outputs.version }}"
          TAG_NAME="${{ steps.check_commit.outputs.tag_name }}"
          REPO="${{ github.repository }}"
          SERVER="${{ github.server_url }}"

          CHANGELOG_CONTENT=$(awk "/^## \[v?${VERSION}/,/^## \[/ {exit}" CHANGELOG.md | head -n -1)

          if [ -z "$(echo "$CHANGELOG_CONTENT" | tr -d '[:space:]')" ]; then
            CHANGELOG_CONTENT=$'### 📝 Changes\n\n- 常规更新与改进\n- 详见 [CHANGELOG.md]('"$SERVER/$REPO"'/blob/main/CHANGELOG.md)'
          fi

          {
            echo "## v$VERSION"
            echo ""
            echo "### 📦 Downloads"
            echo "- **Build artifact**: [${{ github.event.repository.name }}_$VERSION.zip]($SERVER/$REPO/releases/download/$TAG_NAME/${{ github.event.repository.name }}_$VERSION.zip)"
            echo ""
            echo "### 📝 What's Changed"
            echo ""
            echo "$CHANGELOG_CONTENT"
            echo ""
            echo "---"
            echo ""
            echo "**🤖 This release was automatically created from commit:** \`${{ github.sha }}\`"
          } > release-body.md

          echo "✅ Release body generated"

      - name: Package artifact
        if: steps.check_commit.outputs.should_release == 'true' && steps.check_tag.outputs.tag_exists == 'false'
        run: |
          cd dist
          zip -r "../${{ github.event.repository.name }}_${{ steps.check_commit.outputs.version }}.zip" .
          cd ..

          if [ ! -f "${{ github.event.repository.name }}_${{ steps.check_commit.outputs.version }}.zip" ]; then
            echo "ERROR: ZIP file not created"
            exit 1
          fi
          ls -la *.zip

      - name: Create Git Tag
        if: steps.check_commit.outputs.should_release == 'true' && steps.check_tag.outputs.tag_exists == 'false'
        run: |
          TAG_NAME="${{ steps.check_commit.outputs.tag_name }}"
          VERSION="${{ steps.check_commit.outputs.version }}"

          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"

          git tag -a "$TAG_NAME" -m "Release $VERSION"
          git push origin "$TAG_NAME"

          echo "✅ Git tag $TAG_NAME created and pushed"

      - name: Create Release
        if: steps.check_commit.outputs.should_release == 'true' && steps.check_tag.outputs.tag_exists == 'false'
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ steps.check_commit.outputs.tag_name }}
          name: v${{ steps.check_commit.outputs.version }}
          body_path: release-body.md
          files: |
            ${{ github.event.repository.name }}_${{ steps.check_commit.outputs.version }}.zip
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Skip Release (Invalid Commit)
        if: steps.check_commit.outputs.should_release == 'false'
        run: |
          echo "ℹ️ Skipping release - commit message does not match release format"
          echo "Expected format: chore(release): x.x.x"
          echo "Current commit: $(git log -1 --pretty=%B)"

      - name: Skip Release (Tag Exists)
        if: steps.check_commit.outputs.should_release == 'true' && steps.check_tag.outputs.tag_exists == 'true'
        run: |
          echo "ℹ️ Skipping release - tag ${{ steps.check_commit.outputs.tag_name }} already exists"
```

### 10.2 工作流说明

| 项 | 说明 |
|:---|:-----|
| **触发条件** | push 到 `main` 分支，commit message 必须为 `chore(release): x.x.x` 格式；忽略纯文档变更 |
| **权限** | `contents: write` + `packages: write`，用于创建 tag 和 Release |
| **commit 格式** | 使用正则 `^chore\(release\):\ (\d+\.\d+\.\d+)` 校验，**不带 `v` 前缀** |
| **tag 去重** | 检查远端是否已存在 tag，防止重复发布 |
| **CHANGELOG** | 从 `CHANGELOG.md` 中提取当前版本的变更内容，自动生成 Release body |
| **产物** | 构建产出 `dist/` 目录，打包为 `{仓库名}_{版本号}.zip` |
| **Release** | 自动创建 Git tag 并推送到远端，使用 `softprops/action-gh-release` 创建 Release 并挂载 zip |

### 10.3 发布流程

配合本地 `scripts/release.cjs` 发版脚本，完整流程为：

```bash
# 1. 本地执行发版（bump 版本 → 更新 CHANGELOG → git commit + 本地 tag）
pnpm run release:patch

# 2. 只推送 commit（不推 tags），tags 由 CI 自动创建
git push
```

CI 自动完成：
1. 检测到 commit 为 `chore(release): x.x.x`
2. 安装依赖 → 构建 → 打包 zip
3. 从 `CHANGELOG.md` 提取当前版本变更内容
4. 自动创建远端 Git tag `vx.x.x`
5. 创建 GitHub Release 并挂载 zip 包

### 10.4 技术栈扩展

不同技术栈在基础 CI 上扩展专属步骤：

| 技术栈 | 额外步骤 |
|:-------|:---------|
| React / Vue | 无需额外步骤，`build` 产出 `dist/` 直接打包 |
| Node API | 替换构建步骤为 Docker 构建和推送 |
| Chrome 扩展 | 打包后验证 `manifest.json` 是否存在 |
| VS Code 扩展 | 见 `fe-setup-vsc-config-plugin` skill（vsce package → .vsix） |
| npm 包发布 | 在 Release 步骤前追加 `npm publish`（需配置 `NPM_TOKEN`） |

> 本 skill 提供 **通用发版 CI 骨架**，各技术栈 skill 在此基础上追加专属步骤。

---

## 11. AI 协作规范（AGENTS.md）

AGENTS.md 是项目级 AI 协作规范文档，指导 AI Agent（Claude Code、Cursor 等）如何与项目协作。该文件必须存放在**项目根目录**。

### 11.1 初始化与冲突处理

当为项目配置 AGENTS.md 时，按以下逻辑处理：

```
检查项目根目录是否已存在 AGENTS.md
├── 不存在 → 直接创建
└── 存在 → 提示用户：
    ├── [合并] 将新规范与现有文件智能合并（保留已有内容，追加缺失规范）
    ├── [舍弃] 跳过创建，保持现有文件不变
    └── [替换] 备份原文件为 AGENTS.md.backup.<timestamp>，写入新内容
```

### 11.2 AGENTS.md 模板

**文件**：`AGENTS.md`

```markdown
# AI 协作规范

本文档规范 AI Agent 与本项目的协作方式，适用于 Claude Code、Cursor 等工具。

## 1. 需求与任务管理

- 需求确认后，AI 辅助拆解为可执行任务，输出任务列表并关联对应文档
- 每个任务完成时，AI 必须同步更新关联文档和任务状态
- **禁止** AI 在需求未确认前直接开始编码

## 2. 代码审查（CR）规范

- 每次 CR 后生成 CR 报告，存放于 `docs/cr/` 目录
- CR 报告必须包含：对比分支（base ↔ target）、使用的 AI 模型、CR 时间、关键发现与建议
- 严重问题（安全/性能/逻辑错误）必须人工复核后方可合并

## 3. 提交代码规范

- 默认使用 `fe-commit` skill 的提交规范
- Commit message 使用**中文描述**，type 使用英文（如 `feat: 添加用户登录`）
- 禁止无意义提交（如 `fix: 111`、`update`）

## 4. AI 安全与权限边界

- **禁止** AI 处理、生成或暴露密钥、Token、密码、数据库连接字符串等敏感信息
- **禁止** AI 直接执行生产环境操作（部署、数据库变更、删除数据）
- **禁止** AI 执行破坏性命令（`rm -rf`、`DROP TABLE`、`git reset --hard` 等）
- AI 发现代码中包含硬编码敏感信息时，必须告警并建议改用环境变量
- AI 发现安全漏洞时，必须主动生成 issue 并标注风险等级

## 5. AI 编码规范（强制性）

- **圈复杂度**：AI 生成的函数圈复杂度不得超过 10，超过时必须拆分
- **注释规范**：只写"为什么"（WHY），不写"做什么"（WHAT）；禁止无意义注释
- **避免幻觉**：引入新 API / 库时必须确认其真实存在，优先使用项目已有依赖
- **禁止 mock 数据**：不生成 mock 数据或占位逻辑作为生产代码
- **Lint 通过**：生成的代码必须通过项目已有 lint 规则检查

## 6. AI 文档协作

- 代码变更涉及公共 API、配置项、环境变量时，AI 需同步更新对应文档
- README 中关键信息（安装步骤、环境要求、脚本说明）变更后需即时同步
- 文档使用中文撰写，技术术语保留英文

## 7. AI 上下文与 Memory 管理

- 鼓励使用项目 `.claude/memory/` 或等效机制记录跨会话上下文
- 每个 AI 会话结束时，主动总结本次变更要点和待办事项
- 多会话交接时，优先读取 Memory 和最近的 AGENTS.md / 任务文档

## 8. AI 测试协作

- AI 辅助生成测试时，必须覆盖正常路径 + 至少一个异常路径
- 禁止生成"为了测试而测试"的无意义用例（如测 getter/setter）
- 测试文件命名与位置遵循项目已有约定

## 9. 工具使用限制

- AI 使用 Bash 工具执行写操作（文件删除、git push、npm publish）前需用户显式确认
- AI 可以自主执行的：文件读取、代码分析、lint 检查、本地测试运行
- AI 使用 MCP / 外部 API 时，需说明调用目的和预期副作用
```

---

## 12. 完整文件清单

落地完成后，项目根目录应包含以下基础配置：

```
.
├── .npmrc
├── .nvmrc
├── .gitignore
├── .editorconfig
├── .eslintrc.cjs
├── .eslintignore
├── .prettierrc
├── .prettierignore
├── .env.example
├── AGENTS.md             # AI 协作规范
├── pnpm-workspace.yaml   # Monorepo 场景
├── scripts/
│   └── release.cjs       # 发版脚本
├── .github/
│   └── workflows/
│       └── release.yml      # GitHub Actions 自动发版
├── docs/
│   └── cr/               # CR 报告目录
├── CHANGELOG.md
└── package.json          # 含 engines、scripts
```

---

## 13. 配置检查脚本

用于初始化时校验项目是否已配置 AGENTS.md，并提供合并/舍弃/替换选项。

**文件**：`scripts/init-agents-md.cjs`

```javascript
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const AGENTS_PATH = path.join(process.cwd(), 'AGENTS.md');
const TEMPLATE_PATH = path.join(__dirname, '..', 'templates', 'AGENTS.md.template');

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    resolve(answer.trim().toLowerCase());
  }));
}

async function main() {
  const templateContent = fs.existsSync(TEMPLATE_PATH)
    ? fs.readFileSync(TEMPLATE_PATH, 'utf-8')
    : getDefaultTemplate();

  if (!fs.existsSync(AGENTS_PATH)) {
    fs.writeFileSync(AGENTS_PATH, templateContent, 'utf-8');
    console.log('✅ AGENTS.md created successfully.');
    return;
  }

  console.log('⚠️  AGENTS.md already exists.');
  const choice = await prompt('Choose action: [m]erge / [s]kip / [r]eplace: ');

  if (choice === 'r' || choice === 'replace') {
    const backupPath = `AGENTS.md.backup.${Date.now()}`;
    fs.renameSync(AGENTS_PATH, backupPath);
    fs.writeFileSync(AGENTS_PATH, templateContent, 'utf-8');
    console.log(`✅ Replaced. Original backed up to ${backupPath}`);
  } else if (choice === 'm' || choice === 'merge') {
    const existing = fs.readFileSync(AGENTS_PATH, 'utf-8');
    // 简单合并策略：在文件末尾追加模板中缺失的章节
    const merged = existing + '\n\n<!-- Merged content -->\n' + templateContent;
    fs.writeFileSync(AGENTS_PATH, merged, 'utf-8');
    console.log('✅ Merged new content into existing AGENTS.md.');
  } else {
    console.log('⏭️  Skipped. No changes made.');
  }
}

function getDefaultTemplate() {
  return `# AI 协作规范\n\n<!-- Default template placeholder -->\n`;
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
```

### 使用方式

```bash
# 在项目中执行
node scripts/init-agents-md.cjs
```

---

## 14. 与其他 Skill 的关系

| Skill | 职责 | 与本 Skill 的关系 |
|:------|:-----|:----------------|
| `fe-commit` | Commit 规范 + CHANGELOG 生成 | 本 skill 引用其规范，不重复实现 |
| `fe-setup-vsc-config-plugin` | VS Code 扩展专属工程化配置 | 本 skill 提供通用基础，其提供扩展专属流程及 CI 打包 |
| `fe-react-stack` / `fe-node-dev-stack` | 具体技术栈开发规范 | 在本 skill 基础配置上叠加技术栈专属规则 |

---

## 15. 代码审查检查项

- [ ] 是否使用 pnpm 作为包管理器
- [ ] `.npmrc` 是否配置了统一镜像源
- [ ] `.nvmrc` 和 `package.json#engines` 是否锁定了 Node 版本
- [ ] `.gitignore` 是否覆盖了常见忽略项
- [ ] `.editorconfig` 是否统一了编辑器基础行为
- [ ] ESLint + Prettier 配置是否为通用基础版（无框架绑定）
- [ ] `.env.example` 是否完整记录了所需环境变量
- [ ] `scripts/release.cjs` 是否使用 `chore(release): x.x.x` 格式（不带 `v` 前缀）
- [ ] `AGENTS.md` 是否已放置在项目根目录
- [ ] AGENTS.md 是否覆盖了：需求管理、CR 规范、提交规范、安全边界、编码规范、文档协作、Memory 管理、测试协作、工具限制
- [ ] 安全漏洞发现时是否要求主动生成 issue
- [ ] 编码规范是否强制要求圈复杂度不超过 10
- [ ] `.github/workflows/release.yml` 是否包含 commit 格式校验 + tag 去重 + 构建 + 打包 + Release 全流程
- [ ] CI 是否使用了正则 `^chore\(release\):\ (\d+\.\d+\.\d+)` 校验 commit 格式
- [ ] CI 是否有 tag 已存在的检查，防止重复发布
- [ ] 发版流程是否先本地 `release.cjs` → `git push`（不推 tags），由 CI 自动创建 tag 和 Release
