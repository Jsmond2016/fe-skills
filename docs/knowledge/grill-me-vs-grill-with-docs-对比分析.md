# Grill-me 与 grill-with-docs 对比分析

> **编写时间**：2026-05-26；**使用模型**：DeepSeek V4 Flash；**用户**：Jsmond2016

---

## 概述

两个 skill 均以 relentless questioning（盘问引擎）为核心机制，逐问题深入、探边界、查依赖，但侧重不同，可互补使用。

## 核心差异对比

| 维度 | grill-me | grill-with-docs |
|------|----------|-----------------|
| 来源 | 自研，持续优化 | 第三方 vendor（mattpocock） |
| 核心机制 | relentless questioning | relentless questioning |
| 独特价值 | Plan.md Distill 模式 — 多轮迭代沉淀 plan.md | 领域文档意识 — 扫描 CONTEXT.md / ADR，术语校对 |
| 输出产物 | .claude/plan.md | CONTEXT.md（术语表）+ 少量 ADR |
| 擅长场景 | 从零梳理方案、沉淀计划 | 已有文档的项目中验证方案一致性 |

## 重叠部分

盘问引擎本质相同。如果只需要被追问理清思路，两者选一即可。

## 互补价值

- **grill-me 独有的**：Plan.md Distill 四阶段模式（盘问 → 初稿 → 迭代 → 移交），能从讨论中沉淀出可执行的 plan.md
- **grill-with-docs 独有的**：自动读取并更新 CONTEXT.md，校准术语，在重大决策点提议创建 ADR。关心的是项目文档里的语言是否精确

## 使用建议

- **做新功能/新项目，从零开始** → 使用 grill-me（产出 plan.md）
- **在已有代码库中改设计，需要对齐现有领域模型** → 使用 grill-with-docs（读懂已有文档，确保新方案术语一致）
- **两者连用**：先用 grill-with-docs 对齐领域语言、更新 CONTEXT.md，再用 grill-me 沉淀 plan.md
