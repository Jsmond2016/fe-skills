---
name: fe-dev-update-doc-by-commit
description: Reconcile previously committed code changes with their branch-bound requirement and development Markdown documents. Use when a user asks to retrospectively audit recent commits, update missing documentation from implemented code, check whether code changes were recorded in docs, or optionally commit the resulting documentation-only changes.
---

# Update Docs By Commit

Reconstruct documentation records from committed code without inventing product requirements. Use `fe-dev-with-doc` as the document contract: its branch-bound document pair remains the authoritative format and location. For `feature/用户管理`, reconcile only `specs/用户管理/用户管理-需求文档.md` and `specs/用户管理/用户管理-开发方案文档.md`; do not use files directly under `specs/` or translate the branch suffix.

## Reconciliation Workflow

1. Read the repository instructions, current branch, and the applicable `specs/{requirement-name}/` document pair. Derive `requirement-name` using the `fe-dev-with-doc` branch rule. Read the `fe-dev-with-doc` Skill before editing documents.
2. Establish the audit range. Use the user-specified commits or range when given. Otherwise inspect recent commits on the current branch and find the earliest unrecorded code change from document implementation records and Git history. State the selected commits and document pair before editing.
3. Inspect each commit's message, changed paths, and diff. Exclude documentation-only commits from the code reconciliation set, but use them as evidence of existing records.
4. Match each code change to a document pair and requirement ID using the branch field, implementation records, affected-file lists, commit references, and behavior described by the diff. Do not infer a relationship merely from a similar filename.
5. For each confirmed missing record, update the bound development document's requirement-to-solution mapping, implementation record, affected scope, validation, and status. Update the requirement document only when the code establishes a clear delivered behavior or scope change that is absent there.
6. Reconcile the final documents against the audited commits. Report the commit range, mapped changes, document edits, unresolved items, and any checks run.

## Document Update Rules

- Preserve existing document structure, terminology, and requirement IDs. Add an implementation record per logical code change; include commit hash when available.
- Distinguish evidence from inference. Describe only behavior demonstrated by the diff, tests, configuration, generated artifacts, or a directly related commit message.
- Do not rewrite history, silently change requirement status, or mark work as verified without an applicable check. Record unavailable validation plainly.
- Keep documentation changes narrowly scoped to the audited commits. Do not modify generated code, source code, or unrelated documents.
- When a code commit contains both documented and undocumented changes, record only the undocumented portion and avoid duplicate entries.

## Stop And Ask

Ask the user before editing when any of these conditions applies:

- No document pair can be confidently associated with a code commit.
- The documents are bound to a different branch, or multiple document pairs are plausible.
- The diff changes product behavior, API contracts, data semantics, or scope in a way the documents do not explain.
- Existing documentation conflicts with the implementation and the correct product decision cannot be established from repository evidence.
- A commit mixes unrelated features and cannot be separated into accurate records.

State the specific commits, conflicting evidence, and the smallest decision needed. Do not alter source code to resolve a documentation discrepancy unless the user separately authorizes a code change.

## Documentation-Only Commit

After updating documents, show the documentation diff and validation result. Create a documentation-only commit only when the user explicitly asks to commit, or their request explicitly includes committing the documentation update. Follow repository commit conventions and include only the reconciled document files.
