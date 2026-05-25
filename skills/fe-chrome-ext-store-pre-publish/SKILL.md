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
- `STORE_SUBMISSION.md` — 商店提交流程与清单
- `PRIVACY.md` — 数据隐私声明

### 0.2 判断是否需要创建或更新

**缺失则创建：** 若 `STORE_SUBMISSION.md` 或 `PRIVACY.md` 不存在，则根据 `manifest.json` 和 `package.json` 中的实际信息生成对应文档。

**存在则检查更新：** 若文档已存在，对比以下项目实际内容与文档中记录的信息是否一致：
- `package.json` 中的 `name`、`version`、`description`
- `manifest.json` 中的 `name`、`version`、`description`、`permissions`、`host_permissions`、`action.default_title`
- 项目当前的构建命令（`package.json` scripts 中与 chrome/extension 相关的命令）
- 项目当前的截图文件是否存在（检查 `assets/`、`images/`、`screenshots/` 等常见目录下的 PNG 文件）

若上述信息有变更则更新对应文档，若无变更则保持不变。

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

### 0.4 报告

完成文档管理后，输出摘要：

```
📋 商店上架文档状态：
  - docs/publish/STORE_SUBMISSION.md → {{已创建 / 已更新 / 无需变更}}
  - docs/publish/PRIVACY.md → {{已创建 / 已更新 / 无需变更}}
```

---

## Step 1: 确认版本与构建

1. 确认当前版本号（`package.json` 中的 `version` 字段）
2. 执行生产构建：
   ```bash
   pnpm build:chrome
   ```
3. 打包 ZIP：
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

- [ ] **Step 0** — 商店上架文档（STORE_SUBMISSION.md + PRIVACY.md）已就绪
- [ ] 扩展图标 128x128 已就绪
- [ ] 至少 1 张功能截图已准备（建议 3-5 张 1280x800）
- [ ] 详细描述已填写完整
- [ ] 分类选择 "Developer Tools"
- [ ] 已逐条填写每个权限的用途说明
- [ ] 数据隐私说明已填写 "不收集用户数据"
- [ ] ZIP 包已打包
- [ ] 版本号已确认
- [ ] 已在本地测试功能正常
- [ ] Edge 额外：搜索关键词、年龄分级、发布者资料

## 快速打包

```bash
# 构建
pnpm build:chrome

# 打包
cd dist_chrome && zip -r ../extension-v$(node -p "require('./package.json').version").zip . && cd ..
```

## Chrome vs Edge 差异

| 项目 | Chrome Web Store | Edge Add-ons |
|------|-----------------|--------------|
| 开发者注册 | $5 一次性注册费 | 无需费用 |
| 审核时间 | 通常数小时到 1 天 | 通常 1-2 个工作日 |
| 构建产物 | 通用 MV3 | 通用 MV3（可共用） |
