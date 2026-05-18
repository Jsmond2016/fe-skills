---
name: fe-code-review
description: 系统性代码审查 — 覆盖项目结构、代码质量、错误处理、性能、安全、测试。适用于代码审查、质量审计、Bug 排查、重构评审、CI 门禁检查。
---

# Code Review

系统性代码审查技能，覆盖 6 个核心维度，产出结构化审查报告。

## 审查维度

### 1. 项目结构与架构

- 目录组织是否合理、职责是否单一
- 模块划分是否清晰、耦合度是否可控
- 依赖关系是否合理（无循环依赖）
- 是否遵循当前项目的约定（命名、文件组织）
- 是否有过度抽象或过度设计

### 2. 代码质量

- TypeScript 类型是否完整（无 `any` 滥用）
- 是否有冗余 / 重复代码
- 命名是否表意清晰（函数名动宾、布尔值用 `is/has/should` 开头）
- 注释是否合理（说明 why 而非 what）
- 圈复杂度是否可控（单一职责、适当提取）
- 副作用是否可控（纯函数优先）

```typescript
// ❌ 不推荐：类型不完整、命名模糊
function process(d: any) {
  return d.map((x: any) => x.n);
}

// ✅ 推荐：类型完整、命名表意
function extractUserNames(users: User[]): string[] {
  return users.map((user) => user.name);
}

// ❌ 不推荐：注释解释 what
// 遍历用户列表获取名称
users.map((u) => u.name);

// ✅ 推荐：注释说明 why（特殊情况才需要）
// 使用 name 而非 displayName 因为后端需要原始值做排序
users.map((u) => u.name);
```

### 3. 错误处理

- API 调用错误是否被捕获（try-catch 或 error boundary）
- 是否返回友好的错误信息（区分系统错误和业务错误）
- 失败时是否有 fallback 机制（默认值、降级 UI）
- 边界条件是否处理（空数据、极端值、并发）
- 异步操作是否有超时处理

```typescript
// ❌ 不推荐：未处理错误
function fetchUsers() {
  return axios.get("/api/users").then((r) => r.data);
}

// ✅ 推荐：错误处理 + 用户反馈
import { message } from "antd";
import { useRequest } from "ahooks";

function useUsers() {
  const { data, error } = useRequest(
    () => axios.get("/api/users").then((r) => r.data),
    {
      onError: (err) => {
        message.error(err.response?.data?.error || "获取用户列表失败");
        console.error("fetchUsers error:", err);
      },
    }
  );
  return { data };
}

// ✅ 推荐：边界条件处理
function UserList({ users }: { users: User[] | null }) {
  if (!users) return <Skeleton />;
  if (users.length === 0) return <Empty description="暂无用户" />;
  return users.map((u) => <UserCard key={u.id} user={u} />);
}
```

### 4. 性能

- 是否有不必要的重复请求（防抖、缓存、去重）
- 列表数据是否使用唯一且稳定的 `key`
- 组件是否不必要地重渲染（`useMemo` / `useCallback` / `React.memo`）
- 大数据集是否使用虚拟列表
- 图片是否懒加载、资源是否优化

```typescript
// ❌ 不推荐：无防抖的搜索
const [keyword, setKeyword] = useState("");
useEffect(() => {
  search(keyword); // 每次输入都请求
}, [keyword]);

// ✅ 推荐：防抖处理
import { useDebounce } from "ahooks";

const [keyword, setKeyword] = useState("");
const debouncedKeyword = useDebounce(keyword, { wait: 300 });

useRequest(() => search(debouncedKeyword), {
  refreshDeps: [debouncedKeyword],
});

// ❌ 不推荐：内联事件回调导致子组件重渲染
<Table columns={columns} dataSource={data} onRow={() => handleRowClick} />

// ✅ 推荐：稳定引用
const handleRowClick = useCallback((record: User) => {
  console.log(record);
}, []);

// ❌ 不推荐：缺少 key 或使用 index
{items.map((item, index) => <Item key={index} data={item} />)}

// ✅ 推荐：使用唯一 id
{items.map((item) => <Item key={item.id} data={item} />)}
```

### 5. 安全

- 用户输入是否校验（前端 + 后端双重校验）
- API 是否有权限控制（认证 + 鉴权）
- 敏感信息是否暴露（Token、密钥、个人数据）
- 是否存在 XSS / SQL 注入风险
- 是否存在不安全的重定向或文件上传

```typescript
// ❌ 不推荐：直接渲染用户输入（XSS 风险）
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ 推荐：使用 React 默认转义
<div>{userInput}</div>

// ❌ 不推荐：敏感信息在前端暴露
localStorage.setItem("token", "eyJ..."); // Token 应使用 httpOnly cookie

// ❌ 不推荐：缺少输入校验
app.post("/api/users", async (c) => {
  const body = await c.req.json(); // 未校验
  await prisma.user.create({ data: body });
});

// ✅ 推荐：Zod 校验
const schema = z.object({ name: z.string().min(1).max(50), email: z.string().email() });
app.post("/api/users", zValidator("json", schema), async (c) => {
  const data = c.req.valid("json");
  await prisma.user.create({ data });
});
```

### 6. 测试

- 测试覆盖率是否覆盖核心逻辑和边界情况
- 测试用例是否有效（断言有意义，非空测试）
- 测试是否容易维护（不依赖实现细节）
- 是否包含异常场景测试

```typescript
// ❌ 不推荐：无效测试
it("works", () => {
  const result = add(1, 2);
  expect(result).toBeDefined();
});

// ✅ 推荐：有效断言
it("should return sum of two numbers", () => {
  expect(add(1, 2)).toBe(3);
  expect(add(-1, 1)).toBe(0);
  expect(add(0, 0)).toBe(0);
});

// ✅ 推荐：异常场景测试
it("should throw when input is negative", () => {
  expect(() => processAge(-1)).toThrow("Age must be positive");
});
```

## 审查流程

### 准备阶段

1. 确定审查范围（全量 / 增量 / 特定模块）
2. 获取分支 diff 或文件列表
3. 确认项目使用的主要技术栈和约定
4. 了解业务上下文

### 审查执行

```
项目结构 → 代码质量 → 错误处理 → 性能 → 安全 → 测试
```

### 产出格式

按问题严重程度分级，每个问题附带文件和修复建议：

```markdown
# Code Review Report

## 概况
- 审查范围：src/pages/UserList.tsx, src/services/user.ts
- 总评：B
- 问题数：严重 1 / 中等 2 / 建议 3

## 严重问题（必须修复）
### [CR-001] 用户输入未校验直接传入 API
- **文件**: `src/services/user.ts:12`
- **问题**: `createUser` 直接传递用户输入，可能导致注入攻击
- **建议**: 
```typescript
// 使用 Zod 校验后再提交
const schema = z.object({ name: z.string().min(1), email: z.string().email() });
const validated = schema.parse(input);
await createUser(validated);
```

## 中等问题（建议修复）
### [CR-002] 列表缺少 key prop
- **文件**: `src/pages/UserList.tsx:45`
- **问题**: 使用数组 index 作为 key
- **建议**: 改为 `key={user.id}`

## 优化建议（可做可不做）
### [CR-003] 搜索可增加防抖
...
```

## 评级标准

| 等级 | 说明 | 行动建议 |
|:----:|:------|:---------|
| A | 代码质量优秀，少量建议项 | 可直接合并 |
| B | 总体良好，有一些可改进点 | 修复中等问题后合并 |
| C | 存在若干需修复问题 | 修复严重问题后重新审查 |
| D | 存在严重问题，需重构 | 拒绝合并，重新设计 |

## 审查注意原则

1. **关注逻辑而非风格**：风格问题交给 ESLint / Prettier
2. **给出修复建议而非只指出问题**：提供具体代码示例
3. **尊重上下文**：有些看似不合理的选择可能是业务妥协
4. **一事一议**：每个问题独立描述，避免笼统概括
5. **保持建设性**：用 "建议" 而非 "批评" 的语气
6. **区分严重程度**：明确区分必须修复 vs 建议优化

## 代码审查检查项

- [ ] 是否存在类型安全风险（any 滥用、类型断言）
- [ ] 是否处理了所有错误路径
- [ ] 是否存在性能隐患（不必要的渲染、重复请求）
- [ ] 是否存在安全漏洞（XSS、注入、敏感信息泄露）
- [ ] 测试是否覆盖核心逻辑和边界情况
- [ ] 是否有重复代码可提取
- [ ] 是否有死代码（未使用的 import、变量、组件）
