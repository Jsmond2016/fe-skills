---
name: fe-chrome-ext-store-pre-publish
description: 发布 Chrome 扩展到 Chrome Web Store 和 Edge Add-ons 的完整预发布流程，包含构建打包、表单填写、权限说明、截图规范与提交流程。
---

# Chrome Extension 商店发布流程

将 Chrome Extension (MV3) 发布到 Chrome Web Store 和 Microsoft Edge Add-ons 的完整指南。适用于任何基于 Vite + TypeScript + Manifest V3 构建的浏览器扩展项目。

---

## Step 0: 商店上架准备文档管理

发布前先检查插件项目中是否已包含商店上架准备文档，若缺失则创建，若过时则更新。

### 0.1 检测已有文档

在 `docs/publish/` 目录下扫描以下文件：

| 文件 | 语言 | 说明 |
|------|------|------|
| `STORE_SUBMISSION.md` | 简体中文 | 商店提交流程与清单 |
| `STORE_SUBMISSION.en.md` | English | Store submission checklist |
| `chrome-web-store-listing.md` | 简体中文 | Chrome Web Store 上架信息表 |
| `chrome-web-store-listing.en.md` | English | Chrome Web Store listing details |
| `edge-addons-listing.md` | 简体中文 | Edge Add-ons 上架信息表 |
| `edge-addons-listing.en.md` | English | Edge Add-ons listing details |
| `PRIVACY.md` | 简体中文 | 数据隐私声明 |
| `PRIVACY.en.md` | English | Privacy policy |

### 0.2 判断是否需要创建或更新

**缺失则创建：** 若任一文件不存在，则根据 `manifest.json` 和 `package.json` 中的实际信息生成对应文档（中英文各一份）。

**存在则检查更新：** 若文档已存在，对比以下项目实际内容与文档中记录的信息是否一致：
- `package.json` 中的 `name`、`version`、`description`
- `manifest.json` 中的 `name`、`version`、`description`、`permissions`、`host_permissions`、`action.default_title`
- 项目当前的构建命令（`package.json` scripts 中与 chrome/extension 相关的命令）
- 项目当前的截图文件是否存在（检查 `assets/`、`images/`、`screenshots/` 等常见目录下的 PNG 文件）

若上述信息有变更则同时更新中英文文档，若无变更则保持不变。

### 0.3 文档模板

#### STORE_SUBMISSION.md 模板

在 `docs/publish/` 目录下创建 `STORE_SUBMISSION.md`，包含以下内容：

````markdown
# Chrome Extension 商店提交流程

## 扩展信息

| 字段 | 内容 |
|------|------|
| **名称** | {{manifest.json 的 name}} |
| **版本** | {{package.json 的 version}} |
| **描述** | {{manifest.json 的 description}} |
| **类别** | Developer Tools |
| **语言** | 简体中文 (zh-CN) |

## 发布前检查清单

- [ ] 扩展图标 128x128 已就绪（检查 `manifest.json` 中 `icons` 字段指向的文件）
- [ ] 至少 1 张功能截图已准备（建议 3-5 张 1280x800）
- [ ] 截图文件存放在项目目录中（截图文件路径）
- [ ] 详细描述已填写完整
- [ ] 分类选择 "Developer Tools"
- [ ] 已逐条填写每个权限的用途说明
- [ ] 数据隐私说明已填写 "不收集用户数据"
- [ ] ZIP 包已打包
- [ ] 版本号已确认
- [ ] 已在本地测试功能正常
- [ ] Edge 额外：搜索关键词、年龄分级、发布者资料

## 权限说明

{{遍历 manifest.json 的 permissions 和 host_permissions，逐条生成用途说明}}

## 构建与打包

```bash
# 构建
{{package.json 中的构建命令}}

# 打包
cd {{构建输出目录}} && zip -r ../extension-v{{版本号}}.zip . && cd ..
```

## 提交流程

### Chrome Web Store
1. 访问 https://chrome.google.com/webstore/devconsole
2. 登录 Google 账号
3. 上传 ZIP 包，填写表单

### Edge Add-ons
1. 访问 https://partner.microsoft.com/ → "Edge Add-ons"
2. 登录 Microsoft 账号
3. 上传 ZIP 包，填写表单（与 Chrome 保持一致）
   - 搜索关键词：扩展功能相关词，逗号分隔
   - 定价：免费
   - 可见性：公开
   - 年龄分级：3+
````

#### PRIVACY.md 模板

在 `docs/publish/` 目录下创建 `PRIVACY.md`，根据扩展的实际网络权限（`host_permissions`、`webRequest` 等）生成对应的隐私声明：

````markdown
# 隐私声明

**{{manifest.json 的 name}}** (v{{package.json 的 version}})

## 数据收集与使用

{{根据 manifest.json 权限生成：
   - 如果有 webRequest / host_permissions：说明仅读取请求头，用于调试，不收集请求体
   - 如果有 storage：说明仅用于本地持久化配置和缓存
   - 如果有 tabs / activeTab：说明仅用户主动触发时读取标签信息
   - 如果有 identity / 登录类权限：说明 OAuth 流程中的数据使用方式
   - 默认兜底声明：
}}
1. 本扩展不会收集、上传或分享任何用户数据到远程服务器。
2. 所有数据仅在本地浏览器中处理，不会离开用户的设备。
3. 用户配置通过 chrome.storage 保存，仅用于在已登录同一账号的浏览器之间同步配置。
4. 本扩展不会读取或存储用户的浏览历史、书签、密码或其他个人信息。
5. 本扩展不会向任何第三方服务发送数据。
6. 本扩展不执行任何远程代码，所有代码均打包在扩展包内。

## 权限用途

| 权限 | 用途 |
|------|------|
| {{权限名}} | {{根据实际权限生成的用途说明}} |

## 数据保留

用户可通过卸载扩展来撤销所有数据访问权限。已保存的配置数据可通过 chrome://extensions 中的扩展选项页面清除。

## 更新

本隐私声明随扩展版本更新。如有重大变更，将在扩展更新说明中告知。
````

#### STORE_SUBMISSION.en.md 模板（English）

在 `docs/publish/` 目录下创建 `STORE_SUBMISSION.en.md`：

````markdown
# Chrome Extension Store Submission Guide

## Extension Info

| Field | Value |
|-------|-------|
| **Name** | {{name from manifest.json}} |
| **Version** | {{version from package.json}} |
| **Description** | {{description from manifest.json}} |
| **Category** | Developer Tools |
| **Language** | English (en) |

## Pre-publish Checklist

- [ ] Extension icon 128x128 ready (check the `icons` field in `manifest.json`)
- [ ] At least 1 feature screenshot prepared (3-5 screenshots at 1280x800 recommended)
- [ ] Screenshot files exist in the project directory
- [ ] Detailed description completed
- [ ] Category set to "Developer Tools"
- [ ] Permission justification provided for each permission
- [ ] Data privacy declaration states "no user data collected"
- [ ] ZIP package ready
- [ ] Version number confirmed
- [ ] Functionality tested locally
- [ ] Edge add-ons extras: search terms, age rating, publisher info

## Permissions Justification

{{Iterate manifest.json permissions and host_permissions, generate justification for each}}

## Build & Package

```bash
# Build
{{build command from package.json}}

# Package
cd {{build output dir}} && zip -r ../extension-v{{version}}.zip . && cd ..
```

## Submission Process

### Chrome Web Store
1. Visit https://chrome.google.com/webstore/devconsole
2. Sign in with your Google account
3. Upload the ZIP package and fill in the form

### Edge Add-ons
1. Visit https://partner.microsoft.com/ → "Edge Add-ons"
2. Sign in with your Microsoft account
3. Upload the ZIP package, fill in the form (align with Chrome):
   - Search terms: extension feature keywords, comma-separated
   - Pricing: Free
   - Visibility: Public
   - Age rating: 3+
````

#### PRIVACY.en.md 模板（English）

在 `docs/publish/` 目录下创建 `PRIVACY.en.md`：

````markdown
# Privacy Policy

**{{name from manifest.json}}** (v{{version from package.json}})

## Data Collection and Use

{{Generate based on manifest.json permissions:
   - If webRequest / host_permissions: only reads request headers for debugging, does not collect request bodies
   - If storage: used solely for local configuration persistence and caching
   - If tabs / activeTab: only reads tab info when user actively triggers the extension
   - If identity / login permissions: describes OAuth data usage
   - Default fallback:
}}
1. This extension does not collect, upload, or share any user data to remote servers.
2. All data is processed locally in the browser and never leaves the user's device.
3. User preferences are saved via chrome.storage, used only for syncing settings across devices signed into the same account.
4. This extension does not read or store browsing history, bookmarks, passwords, or other personal information.
5. This extension does not send data to any third-party services.
6. This extension does not execute any remote code — all code is bundled within the extension package.

## Permission Usage

| Permission | Purpose |
|------------|---------|
| {{permission name}} | {{usage description generated from actual permissions}} |

## Data Retention

Users can revoke all data access by uninstalling the extension. Saved configuration data can be cleared via the extension options page at chrome://extensions.

## Updates

This privacy policy is updated as the extension version changes. Material changes will be communicated in the extension update notes.
````

#### chrome-web-store-listing.md 模板

在 `docs/publish/` 目录下创建 `chrome-web-store-listing.md`，填写 Chrome Web Store 上架表单的实际内容（可直接复制粘贴到开发者控制台）：

````markdown
# Chrome Web Store 上架信息

> 以下内容用于 Chrome Web Store 开发者控制台表单填写。

## 摘要（Short Description）

{{一句话描述扩展核心功能，不超过 132 个字符}}

## 详细描述（Detailed Description）

{{功能列表 + 适用场景，每项一行，建议包含 3-5 个要点}}

**功能特性：**

- {{功能 1}}
- {{功能 2}}
- {{功能 3}}

**适用场景：**

- {{场景 1}}
- {{场景 2}}

## 类别

Developer Tools

## 语言

简体中文 (zh-CN)

## 截图说明

| 截图 | 内容 |
|------|------|
| 截图 1 | 扩展弹出面板主界面 |
| 截图 2 | 设置/配置页面 |
| 截图 3 | 功能效果展示 |
| 截图 4 | {{可选高级功能展示}} |

## 权限用途

| 权限 | 用途 |
|------|------|
| {{权限名}} | {{用途说明}} |
````

#### chrome-web-store-listing.en.md 模板（English）

在 `docs/publish/` 目录下创建 `chrome-web-store-listing.en.md`：

````markdown
# Chrome Web Store Listing Details

> Content for Chrome Web Store developer console listing.

## Short Description

{{One-sentence description of the extension's core functionality, max 132 characters}}

## Detailed Description

{{Feature list + use cases, one per line, 3-5 bullet points recommended}}

**Features:**

- {{Feature 1}}
- {{Feature 2}}
- {{Feature 3}}

**Use Cases:**

- {{Use case 1}}
- {{Use case 2}}

## Category

Developer Tools

## Language

English (en)

## Screenshot Descriptions

| Screenshot | Content |
|------------|---------|
| Screenshot 1 | Extension popup main interface |
| Screenshot 2 | Settings / configuration page |
| Screenshot 3 | Feature demonstration |
| Screenshot 4 | {{Optional advanced feature showcase}} |

## Permission Justifications

| Permission | Purpose |
|------------|---------|
| {{permission name}} | {{justification}} |
````

#### edge-addons-listing.md 模板

在 `docs/publish/` 目录下创建 `edge-addons-listing.md`：

````markdown
# Edge Add-ons 上架信息

> 以下内容用于 Microsoft Edge Add-ons 开发者控制台表单填写。

## 摘要（Short Description）

{{一句话描述扩展核心功能，不超过 132 个字符}}

## 详细描述（Detailed Description）

{{与 Chrome Web Store 详细描述保持一致}}

## 类别

Developer Tools

## 搜索关键词

{{扩展功能相关词，逗号分隔}}，例如：`开发者工具, 调试, 网络请求, {{功能词}}`

## 定价

免费

## 可见性

公开

## 年龄分级

3+

## 截图说明

| 截图 | 内容 |
|------|------|
| 截图 1 | 扩展弹出面板主界面 |
| 截图 2 | 设置/配置页面 |
| 截图 3 | 功能效果展示 |
````

#### edge-addons-listing.en.md 模板（English）

在 `docs/publish/` 目录下创建 `edge-addons-listing.en.md`：

````markdown
# Edge Add-ons Listing Details

> Content for Microsoft Edge Add-ons developer console listing.

## Short Description

{{One-sentence description of the extension's core functionality, max 132 characters}}

## Detailed Description

{{Align with Chrome Web Store detailed description}}

## Category

Developer Tools

## Search Terms

{{Extension feature keywords, comma-separated}} e.g.: `developer tools, debug, network request, {{keyword}}`

## Pricing

Free

## Visibility

Public

## Age Rating

3+

## Screenshot Descriptions

| Screenshot | Content |
|------------|---------|
| Screenshot 1 | Extension popup main interface |
| Screenshot 2 | Settings / configuration page |
| Screenshot 3 | Feature demonstration |
````

### 0.4 报告

完成文档管理后，输出摘要：

```
📋 商店上架文档状态：
  - docs/publish/STORE_SUBMISSION.md             → {{已创建 / 已更新 / 无需变更}}
  - docs/publish/STORE_SUBMISSION.en.md          → {{已创建 / 已更新 / 无需变更}}
  - docs/publish/chrome-web-store-listing.md     → {{已创建 / 已更新 / 无需变更}}
  - docs/publish/chrome-web-store-listing.en.md  → {{已创建 / 已更新 / 无需变更}}
  - docs/publish/edge-addons-listing.md          → {{已创建 / 已更新 / 无需变更}}
  - docs/publish/edge-addons-listing.en.md       → {{已创建 / 已更新 / 无需变更}}
  - docs/publish/PRIVACY.md                      → {{已创建 / 已更新 / 无需变更}}
  - docs/publish/PRIVACY.en.md                   → {{已创建 / 已更新 / 无需变更}}
```

---

## Step 1: 确认版本与构建

1. 确认当前版本号（`package.json` 中的 `version` 字段）
2. 执行生产构建：
   ```bash
   pnpm build:chrome
   ```
3. 打包 ZIP（推荐使用打包脚本，详见「本地打包」章节）：
   ```bash
   cd dist_chrome && zip -r ../extension-v<版本号>.zip . && cd ..
   ```

## Step 2: Chrome Web Store 发布

### 2.1 上传与基础信息

1. 访问 https://chrome.google.com/webstore/devconsole
2. 使用 Google 账号登录（需支付 $5 一次性注册费）
3. 点击 "New item" 上传 ZIP 包
4. 填写表单：

| 字段 | 内容 |
|------|------|
| **扩展名称** | 与 manifest.json 中 `name` 一致 |
| **摘要 (Short Description)** | 一句话描述扩展核心功能 |
| **详细描述 (Detailed Description)** | 功能列表 + 适用场景，每项一行 |
| **类别** | Developer Tools |
| **语言** | 简体中文 (zh-CN) |

### 2.2 权限声明

逐条填写每个权限的用途，以 `activeTab`、`tabs`、`webRequest`、`storage`、`<all_urls>` 等为例：

| 权限 | 用途说明模板 |
|------|-------------|
| **activeTab** | 获取当前活动标签页的 URL 和页面标题，仅在用户点击扩展图标时临时生效 |
| **tabs** | 监听标签页 URL 变化和关闭事件，用于管理请求记录的生命周期 |
| **webRequest** | 监听页面 XHR 请求，捕获调试信息。仅读取请求头，不读取或修改请求/响应体 |
| **storage** | 持久化用户配置；在会话期间缓存请求记录 |
| **\<all_urls\>** | 支持用户在配置中添加任意监听域名，仅在用户配置的域名范围内记录请求 |

### 2.3 数据隐私说明

```
数据收集与使用：

1. 扩展不会收集、上传或分享任何用户数据到远程服务器。
2. 所有数据仅在本地浏览器中处理，不会离开用户的设备。
3. 用户配置通过 chrome.storage.sync 保存，仅用于在已登录同一账号的浏览器之间同步配置。
4. 扩展不会读取或存储用户的浏览历史、书签、密码或其他个人信息。
5. 扩展不会向任何第三方服务发送数据。
6. 本扩展不执行任何远程代码，所有代码均打包在扩展包内。
```

### 2.4 图片素材

| 素材 | 规格 |
|------|------|
| **扩展图标** | 128x128 PNG |
| **商店截图** | 3-5 张，1280x800 PNG |

截图内容建议：
1. 扩展弹出面板主界面
2. 设置/配置页面
3. 功能效果展示
4. 可选高级功能展示

## Step 3: Edge Add-ons 发布

1. 访问 https://partner.microsoft.com/ → "Edge Add-ons" 模块
2. 使用 Microsoft 账号登录（无需注册费）
3. 点击 "Create new" 上传 ZIP 包（可使用 Chrome 构建产物 `dist_chrome/`）
4. 填写表单，与 Chrome Web Store 内容保持一致：
   - 类别：Developer Tools
   - 搜索关键词：扩展相关功能词，逗号分隔
   - 定价：免费
   - 可见性：公开
   - 年龄分级：3+

## Step 4: 审核与上架

- **审核通过** → 自动上架
- **审核拒绝** → 根据拒绝原因修改后重新提交
  - 权限理由不充分 → 补充代码层面的具体理由
  - 截图不符合要求 → 调整尺寸或内容
- **版本更新** → 修改 `package.json` 版本号 → 执行 Step 0 更新文档 → 重新构建打包 → 在商店控制台上传新包

## 发布前检查清单

- [ ] **Step 0** — 商店上架文档（中英文各一份，共 8 文件）已就绪
- [ ] 扩展图标 128x128 已就绪
- [ ] 至少 1 张功能截图已准备（建议 3-5 张 1280x800）
- [ ] 详细描述已填写完整
- [ ] 分类选择 "Developer Tools"
- [ ] 已逐条填写每个权限的用途说明
- [ ] 数据隐私说明已填写 "不收集用户数据"
- [ ] ZIP 包已打包（推荐使用 `pnpm package` 打包脚本）
- [ ] 版本号已确认
- [ ] 已在本地测试功能正常
- [ ] Edge 额外：搜索关键词、年龄分级、发布者资料

## 本地打包

### 方案一：使用打包脚本（推荐）

创建 `scripts/package-extension.cjs`，统一管理打包流程：

```javascript
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function main() {
  const rootDir = process.cwd();
  const distDir = path.join(rootDir, 'dist');
  const artifactsDir = path.join(rootDir, 'artifacts');
  const pkg = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'),
  );
  const archiveName = `extension-v${pkg.version}.zip`;
  const archivePath = path.join(artifactsDir, archiveName);

  if (!fs.existsSync(distDir)) {
    console.error('dist/ 不存在，请先执行构建');
    process.exit(1);
  }

  fs.mkdirSync(artifactsDir, { recursive: true });
  if (fs.existsSync(archivePath)) fs.rmSync(archivePath);

  const result = spawnSync('zip', ['-r', archivePath, '.', '-x', '*.DS_Store'], {
    cwd: distDir,
    stdio: 'inherit',
  });

  if (result.error) {
    if (result.error.code === 'ENOENT') {
      console.error('未找到 zip 命令，请先安装');
    } else {
      console.error(result.error.message);
    }
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);

  console.log(`Created ${path.relative(rootDir, archivePath)}`);
}

main();
```

在 `package.json` 中添加：

```json
{
  "scripts": {
    "package": "pnpm build && node scripts/package-extension.cjs"
  }
}
```

使用方式：

```bash
pnpm package
# 产物: artifacts/extension-v<版本号>.zip
```

### 方案二：手动打包

```bash
# 构建
pnpm build:chrome

# 打包
cd dist_chrome && zip -r ../extension-v$(node -p "require('./package.json').version").zip . && cd ..
```

### 打包脚本优势

| 对比 | 手动打包 | 打包脚本 |
|------|---------|---------|
| 版本管理 | 需手动指定版本号 | 自动从 package.json 读取 |
| 输出目录 | 散落在项目根目录 | 统一在 artifacts/ |
| 产物清理 | 需手动清理旧包 | 自动覆盖 |
| 错误处理 | 无 | 检查构建目录存在性、命令可用性 |
| 跨平台 | 依赖 shell | Node.js + zip |

### 注意事项

- ZIP 包内容应为构建产物的**根目录结构**（`manifest.json` 位于 ZIP 根目录），不要将构建目录本身打包进去
- 使用 `-x '*.DS_Store'` 排除 macOS 系统文件
- 打包前确认 `dist/` 目录存在且包含完整的构建产物
- 产物建议统一存放在 `artifacts/` 目录，方便 `.gitignore` 排除

## Chrome vs Edge 差异

| 项目 | Chrome Web Store | Edge Add-ons |
|------|-----------------|--------------|
| 开发者注册 | $5 一次性注册费 | 无需费用 |
| 审核时间 | 通常数小时到 1 天 | 通常 1-2 个工作日 |
| 构建产物 | 通用 MV3 | 通用 MV3（可共用） |
