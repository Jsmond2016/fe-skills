# ADR 格式

架构决策记录（Architecture Decision Record）用于记录满足以下三个条件的决策：**难以回退**、**脱离上下文令人费解**、**源于真实权衡**。三个条件缺一则不创建。

## 文件位置

`docs/adr/NNNN-短横线-标题.md`（仓库没有 `docs/adr/` 时惰性创建）

## 结构

```markdown
# <决策标题>

- **状态**：Proposed / Accepted / Deprecated
- **日期**：<YYYY-MM-DD>

## 背景

为什么需要做这个决策——正在角力的因素。

## 决策

我们决定怎么做。

## 后果

这带来了什么便利，又让什么变得更难。
```

## 规则

- 谨慎提供 ADR——仅当三个条件都成立时。
- 首次需要 ADR 时惰性创建文件。
- 一经 Accepted 不得删除；被取代的 ADR 标注 `Deprecated` 状态保留。
