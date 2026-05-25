---
name: fe-large-file-refactor
description: Detects JS/TS/JSX/TSX/Vue files exceeding 450 lines and automatically refactors them — splitting modules, extracting reusable functions/types/components, and optimizing with code-simplifier.
---

You are an expert code refactoring specialist. When this skill is invoked, follow this workflow:

## 1. 检测大文件

- 扫描项目中所有 `.js`、`.ts`、`.jsx`、`.tsx`、`.vue` 文件（排除 `node_modules`、`dist`、`build`、`.git`、`coverage`）
- 对每个文件统计行数
- 列出所有超过 **450 行**的文件（按行数降序排列）
- 如果用户指定了具体文件，只处理指定文件

## 2. 分析文件结构

对于每个大文件，在重构前需要充分理解：

### 职责分析
- 该文件的核心职责是什么？
- 它混合了多少个不同关注点？

### 可提取候选
扫描文件中的以下可提取单元：

| 类别 | 提取目标 | 示例 |
|------|---------|------|
| **类型定义** | interfaces, types, enums | 移入 `types.ts` 或 `*.types.ts` |
| **工具函数** | 纯函数、工具方法 | 移入 `utils.ts` 或 `helpers.ts` |
| **常量/配置** | 静态数据、配置对象、枚举映射 | 移入 `constants.ts` |
| **自定义 Hooks** | React Hooks 逻辑 | 移入 `useXxx.ts` |
| **组件** | 可独立拆分的 UI 组件 | 移入独立组件文件 |
| **工具类** | Class 定义 | 移入 `XxxService.ts` |
| **Vue Composables** | Vue composition 函数 | 移入 `useXxx.ts` / `composables/` |

### 依赖分析
- 提取后的模块与原始文件之间的依赖关系
- 避免循环依赖

## 3. 执行重构

按以下步骤操作，每一步都确保功能完整：

### 步骤 A — 创建新文件
在合适的目录下创建新模块文件，遵循项目已有的目录命名规范。

### 步骤 B — 提取代码
- 将识别出的代码片段原样复制到新文件
- 补全必要的 import 语句
- 添加正确的 export

### 步骤 C — 更新原文件
- 移除已提取的代码段
- 添加对新模块的 import
- 确保原文件的导出接口不变（向后兼容）

### 步骤 D — 验证
- 确保没有死引用或未使用的 import
- 检查是否存在循环依赖
- 确认所有类型引用正确

## 4. 优化（code-simplifier）

在重构完成后，对所有受影响的文件执行 `/code-simplifier` 进行最终优化：
- 重构后的原始文件
- 所有新创建的提取文件

## 5. 报告

向用户输出重构摘要：

```markdown
## 重构报告

### {文件名}
- **重构前**: {N} 行 → **重构后**: {M} 行（-{diff} 行）
- **提取内容**:
  - `{新文件路径}` — {描述提取了什么}
  - `{新文件路径}` — {描述提取了什么}

### 建议后续
- {如有需要进一步重构的建议}
```

## 约束与原则

- **不改变功能逻辑**：重构只改变代码组织方式，不改变行为
- **保持导出接口**：原文件应保持相同的公开导出接口
- **合理的模块粒度**：避免过度拆分，每个新文件自身不应超过 300 行
- **遵循项目规范**：使用项目已有的命名、目录和 import 风格
- **不需要的用户不需要触及到**：提取的文件如果与用户当前工作无关，不需要用户逐一确认
