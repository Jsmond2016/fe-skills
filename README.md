# FE Skills 管理系统

统一的 Cursor 和 Claude skill 管理系统，支持个人 skill 和社区 skill 的统一管理。

## 功能特性

- ✅ **多平台支持**：同时支持 Cursor 和 Claude
- ✅ **个人 skill 管理**：Git 仓库管理，支持版本控制
- ✅ **社区 skill 管理**：通过配置文件管理来源，支持自动更新
- ✅ **便携安装**：Git clone + 运行脚本即可完成安装
- ✅ **自动同步**：支持多设备同步

## 快速开始

### 首次安装（新电脑）

```bash
# 1. 克隆仓库
git clone git@github.com:Jsmond2016/fe-skills.git fe-skills
cd fe-skills

# 2. 运行安装脚本
./install.sh

# 3. 重启 Cursor 和 Claude
```

### 安装到指定平台

```bash
# 仅安装到 Cursor
./install.sh --platform cursor

# 仅安装到 Claude
./install.sh --platform claude
```

### 跳过某些 skill

```bash
# 跳过社区 skill，仅安装个人 skill
./install.sh --skip-community

# 跳过个人 skill，仅安装社区 skill
./install.sh --skip-personal
```

## 目录结构

```
fe-skills/
├── README.md                 # 本文件
├── skill-sources.json        # 社区 skill 来源配置
├── skill-config.json         # 个人 skill 配置
├── install.sh                # 安装脚本
├── update.sh                 # 更新脚本
├── sync.sh                   # 同步脚本
├── .gitignore                # Git 忽略配置
└── skills/                   # 个人 skill 目录
    ├── react-stack/         # React 技术栈 skill
    │   └── SKILL.md
    ├── tailwindcss/         # TailwindCSS skill
    │   └── SKILL.md
    └── README.md            # 个人 skill 说明
```

## 使用指南

### 添加新个人 skill

1. 在 `skills/` 目录创建新 skill：
   ```bash
   mkdir -p skills/my-new-skill
   # 创建 SKILL.md 文件
   ```

2. （可选）更新 `skill-config.json`，添加新 skill 配置

3. 运行安装脚本：
   ```bash
   ./install.sh
   ```

4. 提交到 Git：
   ```bash
   git add skills/my-new-skill
   git commit -m "Add my-new-skill"
   git push
   ```

### 更新社区 skill

```bash
# 更新所有社区 skill
./update.sh --all

# 更新指定 skill
./update.sh --skill vue

# 检查更新（不实际更新）
./update.sh --check
```

### 添加社区 skill 来源

编辑 `skill-sources.json`，添加新的社区 skill 配置：

```json
{
  "name": "skill-name",
  "source": "github",
  "repo": "owner/repo",
  "path": "path/to/skill",
  "ref": "main",
  "enabled": true,
  "platforms": ["cursor", "claude"]
}
```

然后运行：
```bash
./update.sh --skill skill-name
```

### 同步到其他电脑

在其他电脑上：

```bash
git clone git@github.com:Jsmond2016/fe-skills.git fe-skills
cd fe-skills
./install.sh
```

### 同步本地修改

```bash
# 查看变更
git status

# 自动提交并推送
./sync.sh --commit --push

# 自定义提交信息
./sync.sh --commit --push --message "Update skills"
```

## 配置文件说明

### skill-config.json

个人 skill 和平台配置：

```json
{
  "personal_skills": {
    "skill-name": {
      "enabled": true,
      "platforms": ["cursor", "claude"],
      "description": "Skill 描述"
    }
  },
  "platforms": {
    "cursor": {
      "path": "~/.cursor/skills",
      "enabled": true
    },
    "claude": {
      "path": "~/.claude/skills",
      "enabled": true
    }
  }
}
```

### skill-sources.json

社区 skill 来源配置：

```json
{
  "community_skills": [
    {
      "name": "skill-name",
      "source": "github",
      "repo": "owner/repo",
      "path": "path/to/skill",
      "ref": "main",
      "enabled": true,
      "platforms": ["cursor", "claude"]
    }
  ]
}
```

## 脚本说明

### install.sh

安装脚本，支持以下参数：

- `--skip-community`: 跳过社区 skill
- `--skip-personal`: 跳过个人 skill
- `--platform <name>`: 指定平台（cursor/claude）
- `--force`: 强制覆盖已存在的 skill
- `--verbose`: 详细输出

### update.sh

更新脚本，支持以下参数：

- `--all`: 更新所有社区 skill
- `--skill <name>`: 更新指定 skill
- `--check`: 仅检查更新，不实际更新

### sync.sh

同步脚本，支持以下参数：

- `--commit`: 自动提交变更
- `--push`: 自动推送到远程仓库
- `--message <msg>`: 自定义提交信息

## 依赖要求

- `bash` (macOS/Linux)
- `jq` (JSON 解析工具)
  - macOS: `brew install jq`
  - Linux: `apt-get install jq` 或 `yum install jq`
- `git` (用于下载社区 skill)
- `curl` (可选，用于 GitHub API)

## 故障排查

### Skill 不生效

1. 检查文件位置是否正确
2. 确认文件名是 `SKILL.md`（大小写敏感）
3. 检查 YAML frontmatter 格式
4. **重启 Cursor 和 Claude**

### 下载社区 skill 失败

1. 检查网络连接
2. 如果使用私有仓库，设置 `GITHUB_TOKEN` 环境变量：
   ```bash
   export GITHUB_TOKEN=your_token
   ```
3. 检查仓库路径和分支名称是否正确

### jq 命令未找到

安装 jq：
- macOS: `brew install jq`
- Linux: `apt-get install jq` 或 `yum install jq`

## 最佳实践

1. **定期更新**：定期运行 `./update.sh --all` 更新社区 skill
2. **版本控制**：个人 skill 应该提交到 Git
3. **备份**：安装脚本会自动备份现有 skill（在 `.backups/` 目录）
4. **测试**：添加新 skill 后，重启应用测试是否生效

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
