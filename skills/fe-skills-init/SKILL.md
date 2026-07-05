---
name: fe-skills-init
description: 安装 fe-skills 后的一站式初始化。自动同步 skills 到各 AI 平台目录，创建/合并 .claude/settings.local.json 权限配置，让所有 skill 开箱即用。
---

# fe-skills-init

在 `npx skills add Jsmond2016/fe-skills` 后执行，一次完成所有后续配置：

1. **状态检测** — 检查安装、同步、权限配置现状
2. **同步到平台目录** — 将 `.agents/skills/` 链接到 `.claude/skills/`、`.codex/skills/`
3. **配置权限** — 创建或合并 `.claude/settings.local.json`，预授权 skill 所需命令
4. **验证** — 确认结果

## 工作流程

```
检测 → 同步 → 权限配置 → 验证
```

---

## 1. 状态检测

### 1.1 检测安装状态

检查以下路径：

```bash
# 检查 npx skills 是否已安装
ls .agents/skills/ 2>/dev/null && echo "✅ .agents/skills/ 存在"

# 检查同步状态
ls .claude/skills/ 2>/dev/null && echo "✅ .claude/skills/ 存在"
ls .codex/skills/ 2>/dev/null && echo "✅ .codex/skills/ 存在"

# 检查权限配置
cat .claude/settings.local.json 2>/dev/null || echo "⬜ .claude/settings.local.json 不存在"
cat .claude/settings.json 2>/dev/null || echo "⬜ .claude/settings.json 不存在"

# 检查技能锁文件
cat skills-lock.json 2>/dev/null || echo "⬜ skills-lock.json 不存在（未安装）"
```

### 1.2 判断当前状态

| 状态 | 标志 | 处理 |
|:-----|:-----|:-----|
| 未安装 | `.agents/skills/` 不存在，`skills-lock.json` 不存在 | 引导用户执行 `npx skills add` |
| 已安装未同步 | `.agents/skills/` 存在，`.claude/skills/` 不存在或空 | 需要同步 |
| 已同步未配置权限 | 平台目录存在，`.claude/settings.local.json` 不存在 | 需要配置权限 |
| 已完全配置 | 三者都存在 | 检查是否有更新 |

如果检测到未安装状态，提示用户先执行：

```bash
npx skills add Jsmond2016/fe-skills --all -y
```

然后重新运行本 skill（`/fe-skills-init`）。

---

## 2. 同步到平台目录

### 2.1 执行同步脚本

如果 `.agents/skills/` 存在但 `.claude/skills/` 不存在或为空，执行同步：

```bash
# 检查同步脚本是否存在
if [ -f .agents/skills/sync-agent-skills/scripts/sync.cjs ]; then
  echo "✅ sync 脚本存在"
  node .agents/skills/sync-agent-skills/scripts/sync.cjs
else
  echo "⚠ sync 脚本不存在，判断一下同步脚本是否在别的 src 目录"
fi
```

> 如果 sync 脚本不存在，可能是 `.agents/skills/` 结构不同。此时可手动创建 symlink：
>
> ```bash
> mkdir -p .claude/skills .codex/skills
> for skill in .agents/skills/*/; do
>   name=$(basename "$skill")
>   [ -f "$skill/SKILL.md" ] && ln -sf "../../.agents/skills/$name" ".claude/skills/$name"
>   [ -f "$skill/SKILL.md" ] && ln -sf "../../.agents/skills/$name" ".codex/skills/$name"
> done
> ```

### 2.2 验证同步结果

```bash
echo "=== .claude/skills/ ==="
ls .claude/skills/ 2>/dev/null | head -20

echo "=== .codex/skills/ ==="
ls .codex/skills/ 2>/dev/null | head -20
```

目标：每个 `.agents/skills/*/SKILL.md` 对应的 skill 在 `.claude/skills/` 和 `.codex/skills/` 中都有同名的 symlink。

---

## 3. 配置权限

### 3.1 权限配置原则

- 使用 `.claude/settings.local.json`（local 文件不纳入版本控制）
- 如果文件已存在，**合并**而非覆盖，保留用户已有的自定义配置
- 只补充缺失的、skill 需要的权限项

### 3.2 推荐的权限基准

根据 fe-skills 中所有 skill 的使用情况，推荐以下权限集：

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Write",
      "Edit",
      "WebSearch",
      "WebFetch",
      "Agent",
      "Bash(git *)",
      "Bash(pnpm *)",
      "Bash(npm *)",
      "Bash(npx *)",
      "Bash(node *)",
      "Bash(cat *)",
      "Bash(ls *)",
      "Bash(grep *)",
      "Bash(find *)",
      "Bash(mkdir *)",
      "Bash(chmod *)",
      "Bash(cp *)",
      "Bash(rm *)",
      "Bash(zip *)",
      "Bash(lsof *)",
      "Bash(ss *)",
      "Bash(fuser *)",
      "Bash(curl *)"
    ]
  }
}
```

### 3.3 合并策略

读取 `.claude/settings.local.json` 后：

```
1. 如果文件不存在 → 直接写入推荐配置，并提示已创建
2. 如果文件存在但缺少 skills 所需权限 → 合并入 recommendAllow 中缺失的条目
3. 如果文件已包含所有所需权限 → 提示无需变更
4. 如果文件中有 skills 不使用的宽泛权限（如 "Bash" 无限制）→ 保持不动，用户自定义高于推荐
```

合并的算法：
- 读取 `settings.local.json` 中的 `permissions.allow` 数组
- 对于推荐权限列表中的每一项，如果 `allow` 中不存在相同字符串，则追加
- 写回时保留文件原有格式（JSON 缩进等）

### 3.4 执行

若需创建新文件：

```bash
# 确保 .claude/ 存在
mkdir -p .claude

# 写入推荐配置
cat > .claude/settings.local.json << 'EOF'
{
  "permissions": {
    "allow": [
      "Read",
      "Write",
      "Edit",
      "WebSearch",
      "WebFetch",
      "Agent",
      "Bash(git *)",
      "Bash(pnpm *)",
      "Bash(npm *)",
      "Bash(npx *)",
      "Bash(node *)",
      "Bash(cat *)",
      "Bash(ls *)",
      "Bash(grep *)",
      "Bash(find *)",
      "Bash(mkdir *)",
      "Bash(chmod *)",
      "Bash(cp *)",
      "Bash(rm *)",
      "Bash(zip *)",
      "Bash(lsof *)",
      "Bash(ss *)",
      "Bash(fuser *)",
      "Bash(curl *)"
    ]
  }
}
EOF
```

若需合并已有文件，使用 Read 读取现有内容，用 Write 写回合并后的完整内容。

---

## 4. 验证

### 4.1 验证同步

```bash
echo "=== Skills 安装状态 ==="
npx skills list --json 2>/dev/null | node -pe "
  const s = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  console.log('  已安装 skill 数: ' + s.length);
  s.forEach(x => console.log('    - ' + x.name + ' (' + x.scope + ')'));
" 2>/dev/null || echo "  npx skills list 不可用"

echo ""
echo "=== 平台目录状态 ==="
for dir in .agents .claude .codex; do
  skills_count=$(ls "$dir/skills" 2>/dev/null | wc -l | tr -d ' ')
  echo "  $dir/skills/: ${skills_count:-0} skills"
done

echo ""
echo "=== 权限配置 ==="
cat .claude/settings.local.json 2>/dev/null && echo "" || echo "  ⬜ 未配置"
```

### 4.2 输出概览报告

最终向用户输出一份结构化的报告，例如：

```
┌─────────────────────────────────┐
│   FE Skills Init 完成           │
├─────────────────────────────────┤
│ ✅ Skills 已安装: 24            │
│ ✅ .claude/skills/ 已同步: 24   │
│ ✅ .codex/skills/ 已同步: 24    │
│ ✅ 权限已配置 (23 条规则)        │
│                                │
│ 系统占用: Skills +2.5MB         │
└─────────────────────────────────┘
```

---

## 代码审查检查项

- [ ] 检测阶段是否准确判断安装/同步/权限状态
- [ ] 同步脚本执行成功，平台目录 symlink 正确
- [ ] 权限配置合并时未覆盖用户已有自定义项
- [ ] 生成的 `settings.local.json` JSON 格式正确
- [ ] 最终输出清晰的概览报告
