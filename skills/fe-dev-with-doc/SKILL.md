---
name: fe-dev-with-doc
description: Develop project changes from branch-bound, synchronized requirement and implementation-plan Markdown documents. Use whenever a user asks to build, implement, modify, continue, or fix a feature and wants requirements and development decisions recorded, or explicitly invokes $fe-dev-with-doc.
---

# Dev With Doc

Make the project documentation the source of truth for the requested work. Maintain a branch-bound document pair under `specs/`:

```text
specs/{requirement-name}/{requirement-name}-需求文档.md
specs/{requirement-name}/{requirement-name}-开发方案文档.md
```

Derive `requirement-name` from the current `<prefix>/{requirement-name}` branch by removing only the first `<prefix>/` part. `<prefix>` can be anything — a branch type such as `feature` or `fix`, a name, a ticket number, etc. Preserve the complete branch suffix exactly: do not translate it, convert it to kebab-case, or use a name inferred from the request. For example, `fix/用户管理` uses `用户管理`, and its documents are `specs/用户管理/用户管理-需求文档.md` and `specs/用户管理/用户管理-开发方案文档.md`. Reuse the existing directory for follow-up work. Never create these files directly under `specs/`. If the branch has no `/`, has an empty suffix after the first `/`, or an existing pair conflicts with it, ask the user before creating documents.

## Workflow

1. Inspect the repository, current Git branch, and `specs/{requirement-name}/` for an existing matching document pair before changing code. Validate the branch matches `<prefix>/<suffix>` with a non-empty `<suffix>`; do not restrict the `<prefix>` value.
2. For a new requirement, bind both documents to the current development branch and record its exact name. For existing documents, verify that the current branch equals the recorded branch. Do not edit code or its bound documents from another branch; switch to the recorded branch or ask the user to resolve the branch decision.
3. Create or update the requirement document. Record every user-stated requirement as a numbered, testable item. Preserve resolved requirements; mark superseded items with the change reason instead of silently deleting them.
4. Create or update the development document. Map every requirement ID to its confirmed technical approach, affected files or modules, data/API or migration impact, validation, risks, and explicit out-of-scope decisions.
5. For every requirement change, update the requirement document and development plan first. Obtain the user's confirmation for the revised plan before changing code, including when the change appears during implementation.
6. Implement only behavior covered by the confirmed documents. On the bound branch, update the development document for every code change, including internal refactors, fixes, configuration, tests, and generated artifacts; update the requirement document too when behavior or scope changes.
7. Before handoff, reconcile code with both documents. Ensure every active requirement has an implementation status and verification result, and every delivered code change is represented in the development document.

## Requirement Document

Use this structure. Add sections only when relevant.

```markdown
# {Requirement Name} 需求文档

## 开发分支
`<prefix>/example`

## 背景与目标

## 需求范围
| ID  | 需求点 | 验收标准 | 状态                              |
| --- | ------ | -------- | --------------------------------- |
| R1  | ...    | ...      | 待开发 / 已实现 / 已验证 / 已废弃 |

## 非目标

## 变更记录
| 日期 | 变更 | 原因 | 影响的需求 |
| ---- | ---- | ---- | ---------- |
```

## Development Document

Use this structure. Keep requirement IDs aligned with the requirement document.

```markdown
# {Requirement Name} 开发方案文档

## 开发分支
`<prefix>/example`

## 方案概览

## 需求-方案映射
| 需求 ID | 开发方案 | 影响范围 | 验证方式 | 状态                              |
| ------- | -------- | -------- | -------- | --------------------------------- |
| R1      | ...      | ...      | ...      | 待确认 / 已确认 / 已实现 / 已验证 |

## 技术决策

## 实施记录
| 日期 | 代码或方案变更 | 关联需求 | 影响 |
| ---- | -------------- | -------- | ---- |

## 验证结果
```

## Change Rules

- Treat the documents and implementation as one atomic deliverable. Do not leave known drift between them.
- Bind both documents to the same exact Git branch. Treat a branch rename as a document change: update the branch field in both files and record it in both change histories before further implementation.
- On the bound branch, never make a code change without synchronizing the development document in the same work item. Document each changed file or module, its mapped requirement, and its validation impact.
- When a requirement changes, update the requirement document first, revise the mapped plan, obtain user confirmation, then change code. Do not treat a changed requirement as routine implementation, even when the code change is small.
- When implementation exposes a missing requirement, ambiguity, or incompatible existing behavior, pause and ask the user for the product decision. Record the answer before proceeding.
- When a code change is internal and does not alter requirements, document it in the implementation record and update affected files, validation, and status.
- Do not claim a requirement is verified without running an applicable check or clearly recording why verification could not run.
