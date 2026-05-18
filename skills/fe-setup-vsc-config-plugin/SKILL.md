---
name: fe-setup-vsc-config-plugin
description: VS Code 扩展工程化配置指南 — ESLint + Prettier + Husky + Conventional Commits + 自动发布 + CI 打包。提供完整的配置文件模板与落地步骤。
---

# VS Code 扩展工程化配置 (fe-setup-vsc-config-plugin)

为 VS Code 扩展项目提供一套完整的工程化配置方案，覆盖代码规范、Git 提交规范、自动发布流程与 CI 打包。所有配置均提供可直接落地的文件模板。

## 适用场景

- 新建 VS Code 扩展项目，需要快速搭建工程化基础设施
- 现有 VS Code 扩展项目缺少规范，需要补全 ESLint / Prettier / Husky 等配置
- 需要实现自动化版本发布与 GitHub Actions CI 打包流程

## 配置概览

| 模块 | 说明 | 相关文件 |
|:-----|:-----|:---------|
| npm 源 | 淘宝镜像，加速安装 | `.npmrc` |
| 代码格式 | ESLint + Prettier | `.eslintrc.cjs`, `.prettierrc`, `.prettierignore` |
| 提交规范 | Conventional Commits | `commitlint.config.cjs`, `.husky/commit-msg` |
| 提交前校验 | lint-staged + pre-commit | `.husky/pre-commit`, `package.json` 的 `lint-staged` |
| 发布脚本 | release:patch/minor/major | `scripts/release.cjs` |
| CHANGELOG | 基于 conventional-changelog | `CHANGELOG.md` |
| CI 打包 | 推送到 main/master 自动打包 .vsix | `.github/workflows/build.yml` |

## 推荐执行顺序

按以下顺序落地，确保每一步都能独立验证：

1. `.npmrc` 配置淘宝源
2. ESLint + Prettier 配置与脚本，跑通 `lint` / `format`
3. Husky + lint-staged + commitlint
4. `release:patch/minor/major` 脚本与 CHANGELOG
5. GitHub Actions 构建与 `.vsix` 产物上传

---

## 1. npm 源配置

**文件**：`.npmrc`

```
registry=https://registry.npmmirror.com
```

提交到仓库后，项目中执行 `pnpm install` / `npm install` 均走淘宝源；CI 使用同一配置。

---

## 2. 代码格式与规范

### 2.1 依赖安装

```bash
pnpm add -D eslint prettier eslint-config-prettier eslint-plugin-import @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### 2.2 ESLint 配置

**文件**：`.eslintrc.cjs`

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'import/order': 'warn',
  },
  env: {
    node: true,
    es2022: true,
  },
};
```

**文件**：`.eslintignore`

```
out/
dist/
node_modules/
*.vsix
```

### 2.3 Prettier 配置

**文件**：`.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**文件**：`.prettierignore`

```
out/
node_modules/
*.vsix
CHANGELOG.md
```

### 2.4 package.json scripts

```json
{
  "scripts": {
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "format:check": "prettier --check \"src/**/*.ts\""
  }
}
```

---

## 3. Git 提交规范

### 3.1 依赖安装

```bash
pnpm add -D husky lint-staged @commitlint/config-conventional @commitlint/cli
```

### 3.2 Husky 初始化

```bash
# package.json 添加 prepare 脚本
# "prepare": "husky"
# 然后执行
pnpm prepare
```

### 3.3 commit-msg Hook

**文件**：`.husky/commit-msg`

```bash
pnpm commitlint --edit $1
```

### 3.4 pre-commit Hook

**文件**：`.husky/pre-commit`

```bash
pnpm lint-staged
```

### 3.5 lint-staged 配置

**在 `package.json` 中添加**：

```json
{
  "lint-staged": {
    "src/**/*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

### 3.6 Commitlint 配置

**文件**：`commitlint.config.cjs`

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'],
    ],
    'subject-full-stop': [2, 'never', '.'],
    'subject-case': [0],
  },
};
```

### 3.7 提交格式

```
<type>(<scope>): <subject>
```

示例：

```bash
git commit -m "feat: 添加代码片段补全功能"
git commit -m "fix(parser): 修复模板解析错误"
git commit -m "chore(release): v0.1.0"
```

---

## 4. 发布脚本

### 4.1 依赖安装

```bash
pnpm add -D conventional-changelog-cli
```

### 4.2 发布脚本

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

  // 1. Bump version (no git tag)
  execSync(`npm version ${type} --no-git-tag-version`, { stdio: 'inherit' });

  // 2. Read new version
  const pkgPath = path.join(process.cwd(), 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const version = pkg.version;

  // 3. Generate CHANGELOG
  try {
    execSync(
      `npx conventional-changelog -p angular -i CHANGELOG.md -s -r 1`,
      { stdio: 'inherit' }
    );
  } catch {
    console.warn('CHANGELOG generation skipped or failed');
  }

  // 4. Git commit and tag
  execSync('git add package.json CHANGELOG.md', { stdio: 'inherit' });
  execSync(`git commit -m "chore(release): v${version}"`, { stdio: 'inherit' });
  execSync(`git tag v${version}`, { stdio: 'inherit' });

  console.log(`\nRelease v${version} created locally.`);

  // 5. Push if requested
  if (shouldPush) {
    execSync('git push', { stdio: 'inherit' });
    execSync('git push --tags', { stdio: 'inherit' });
    console.log(`Pushed to remote.`);
  } else {
    console.log(`Run the following to push:`);
    console.log(`  git push && git push --tags`);
  }
}

main();
```

### 4.3 package.json scripts

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

### 4.4 发布流程

```bash
# 仅本地生成 commit + tag，不推送
pnpm run release:patch

# patch 版本 + 自动推送到远端
pnpm run release
# 或
pnpm run release:patch:push
```

---

## 5. CHANGELOG

由 `conventional-changelog` 根据 Conventional Commits 历史自动生成并 prepend 到 `CHANGELOG.md`。

首次生成（包含全部历史）：

```bash
npx conventional-changelog -p angular -i CHANGELOG.md -s -r 0
```

后续发布时由 `scripts/release.cjs` 自动更新。

---

## 6. CI 打包（GitHub Actions）

### 6.1 工作流配置

**文件**：`.github/workflows/build.yml`

```yaml
name: Build and Release

on:
  push:
    branches: [main, master]
    paths-ignore:
      - 'README.md'
      - 'docs/**'
      - '*.md'

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Compile
        run: pnpm run compile

      - name: Read version
        id: version
        run: echo "version=$(node -p \"require('./package.json').version\")" >> $GITHUB_OUTPUT

      - name: Package VSIX
        run: |
          npm install -g @vscode/vsce
          vsce package --no-dependencies --out wepy-action-nave-vsc-plugin_v${{ steps.version.outputs.version }}.vsix

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: vsix
          path: wepy-action-nave-vsc-plugin_v${{ steps.version.outputs.version }}.vsix

      - name: Create Release
        if: startsWith(github.event.head_commit.message, 'chore(release):')
        uses: softprops/action-gh-release@v2
        with:
          tag_name: v${{ steps.version.outputs.version }}
          name: v${{ steps.version.outputs.version }}
          files: wepy-action-nave-vsc-plugin_v${{ steps.version.outputs.version }}.vsix
```

### 6.2 CI 说明

| 项 | 说明 |
|:---|:-----|
| **触发条件** | push 到 `main` 或 `master` 分支；忽略纯文档变更 |
| **权限** | `contents: write` 用于创建 Release 和上传 .vsix |
| **步骤** | checkout → 安装 pnpm/Node → `pnpm install --frozen-lockfile` → `pnpm run compile` → vsce package → 上传 artifact → 自动创建 Release（仅 release commit） |
| **Release 条件** | commit message 为 `chore(release): vX.Y.Z` 时自动创建同名 GitHub Release 并挂载 .vsix |
| **下载** | GitHub Actions Artifacts 中下载；release commit 可在仓库 Releases 页下载 |

### 6.3 vsce 打包注意事项

```bash
# 本地预览打包
npx vsce package --no-dependencies

# --no-dependencies 表示不打包 node_modules，适用于运行时无外部依赖的扩展
```

---

## 7. 完整流程示意

```
开发阶段
  代码 → ESLint/Prettier 格式化 → Conventional Commit → commit-msg 校验

发布阶段
  release:patch → bump version → 更新 CHANGELOG → git tag v* → git push + push --tags

CI 阶段
  push 触发 GitHub Actions → compile + vsce package → .vsix artifact
  (release commit 自动创建 GitHub Release 并挂载 .vsix)
```

---

## 8. 常见问题

### Q1: `pnpm prepare` 后没有生成 .husky 目录？

确保 `package.json` 有 `"prepare": "husky"`，然后执行 `pnpm prepare`。如果已存在 `.git`，Husky 会自动初始化 hooks。

### Q2: commit 被拦截，提示不符合规范？

检查 commit message 格式是否为 `<type>: <subject>`，type 必须在 `feat/fix/docs/style/refactor/perf/test/build/ci/chore/revert` 列表中。

### Q3: CI 报 "Resource not accessible by integration"？

确认 `.github/workflows/build.yml` 中声明了 `permissions: contents: write`。

### Q4: vsce 打包失败？

- 检查 `package.json` 中的 `publisher` 字段是否已填写
- 确认 `engines.vscode` 版本范围正确
- 如果使用 `--no-dependencies`，确保扩展不依赖外部 npm 包运行

### Q5: CHANGELOG 没有内容？

首次生成需要带 `-r 0` 参数包含全部历史。后续提交必须遵循 Conventional Commits 格式，否则不会出现在 CHANGELOG 中。

---

## 9. 文件清单

落地完成后，项目根目录应包含以下配置：

```
.
├── .eslintrc.cjs
├── .eslintignore
├── .prettierrc
├── .prettierignore
├── .npmrc
├── commitlint.config.cjs
├── .husky/
│   ├── pre-commit
│   └── commit-msg
├── scripts/
│   └── release.cjs
├── .github/
│   └── workflows/
│       └── build.yml
├── CHANGELOG.md
└── package.json   (含 scripts、lint-staged、prepare)
```
