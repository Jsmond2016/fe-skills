---
name: feedback-skill-creation-workflow
description: 创建新 skill 时，结合 write-a-skill 规范 + npm run create-skill 脚手架
metadata:
  type: feedback
---

创建新 skill 的流程：
1. 用 `npm run create-skill <name>` 建目录和模板 SKILL.md
2. 参考 write-a-skill 的规范来撰写内容 — 重点是 description 要写清触发词（"Use when..."）、SKILL.md 控制在 100 行内、复杂内容拆 REFERENCE.md / scripts/

**Why:** write-a-skill 提供了 description 最佳实践和结构规范，create-skill 负责脚手架，两者结合产出高质量的 skill。

**How to apply:** 用户要求创建新 skill 时，先跑脚手架，再按 write-a-skill 的 Review Checklist 逐项检查后再交付。
