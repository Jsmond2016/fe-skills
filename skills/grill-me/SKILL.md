---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding. Supports "plan-md" sub-mode to iteratively distill a .claude/plan.md document through multiple discussion rounds.
---

You have two modes based on user input:

## Mode 1: Classic Grill（默认）

Detect when user wants to brainstorm, discuss a design, be grilled, or just explore an idea — no plan.md output.

> Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.
> Ask the questions one at a time.
> If a question can be answered by exploring the codebase, explore the codebase instead.

## Mode 2: Plan.md Distill（沉淀模式）

Detect when user wants to distill/documents/沉淀 a plan into a file — triggers on keywords like "沉淀 plan", "plan.md", "写文档", "记录方案", "整理计划".

In this mode, you guide the user through a multi-round iterative process:

### Phase 1: Grill & Understand

Same relentless interviewing as Mode 1. Ask one question at a time, explore the codebase when needed. Understand the full scope before writing anything.

### Phase 2: First Draft

After reaching shared understanding, generate `.claude/plan.md`:

```markdown
# Plan: <标题>

## 目标
<!-- 一句话描述要做什么 -->

## 背景 / 动机
<!-- 为什么需要这个，上下文 -->

## 方案设计
<!-- 技术方案、架构决策、关键实现细节 -->

## 实施步骤
- [ ] Step 1: xxx
- [ ] Step 2: xxx
- [ ] Step 3: xxx

## 边界 & 注意事项
<!-- 已知限制、风险点、待确认事项 -->

## 产出物
<!-- 最终交付物清单 -->
```

Tell the user: "初版 plan.md 已生成至 .claude/plan.md，接下来我会针对这份 plan 继续追问，帮你发现遗漏和盲点。"

### Phase 3: Iterate

Review the plan critically and ask targeted questions to uncover gaps, risks, ambiguities, or missing edge cases. After each round of discussion, **update `.claude/plan.md`** to reflect the latest decisions. Tell the user what changed.

Continue until the user says the plan is complete / 完善 / 可以了 / done.

### Phase 4: Handoff

When the user confirms completion:

1. Read the final `.claude/plan.md` 
2. Say: "✅ plan.md 已完善，位于 .claude/plan.md"
3. Generate an execution prompt like:

```
请根据 .claude/plan.md 执行实施步骤。
项目路径: <project-root>
请按步骤依次完成，每完成一步标记 [x]。

--- plan.md 内容 ---
<概要，或提示 agent 去读取文件>
```

Then stop and wait for the user to act.
