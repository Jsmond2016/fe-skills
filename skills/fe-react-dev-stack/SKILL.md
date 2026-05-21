---
name: fe-react-dev-stack
description: React + TypeScript 项目脚手架与开发最佳实践 — Vite + React 19 + TypeScript + TailwindCSS + antd + Zustand/Jotai + ahooks + React Router 7 + TanStack Query + Ramda（可选）。适用于新项目创建、现有项目维护、功能开发与重构。
---

# React Dev Stack

标准化的 React 项目搭建与开发工作流，涵盖脚手架初始化、组件开发、状态管理、路由、数据请求、样式方案全链路。

## 技术栈

| 类别 | 技术 |
|------|------|
| 包管理 | pnpm |
| 框架 | React 19 + TypeScript（严格模式） |
| 构建 | Vite |
| 路由 | React Router 7 |
| 状态管理 | Zustand / Jotai |
| 服务端状态 | TanStack Query (React Query) |
| Hooks 库 | ahooks |
| UI 组件库 | Ant Design (antd) |
| CSS | Tailwind CSS（工具类优先） |
| 函数式编程 | Ramda（可选） |
| 代码质量 | ESLint + Prettier |
| Git 钩子 | Husky + lint-staged + commitlint |
| 提交规范 | Conventional Commits |

## 项目初始化

### 创建新项目

```bash
pnpm create vite project-name --template react-ts
cd project-name
pnpm install
```

### 安装核心依赖

```bash
# 路由
pnpm add react-router-dom

# 状态管理（二选一或共存）
pnpm add zustand jotai

# 服务端状态
pnpm add @tanstack/react-query

# Hooks
pnpm add ahooks axios

# UI
pnpm add antd @ant-design/icons

# CSS
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 函数式编程（可选）
pnpm add ramda
pnpm add -D @types/ramda

# 代码质量
pnpm add -D eslint prettier eslint-config-prettier
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional
npx husky init
```

## 项目目录结构

```
src/
├── components/       # 通用组件（命名导出）
├── pages/            # 页面组件（默认导出）
├── hooks/            # 自定义 hooks
├── stores/           # Zustand / Jotai stores
├── services/         # API 请求层
├── utils/            # 工具函数
├── types/            # TypeScript 类型定义
├── App.tsx           # 路由配置
└── main.tsx          # 入口
```

---

## 开发工作流

### 创建新页面

1. 在 `src/pages/` 中创建页面组件
2. 在 `src/App.tsx` 中添加路由
3. 使用 antd 组件 + TailwindCSS 构建 UI
4. 通过 Zustand 或 Jotai 管理状态

```typescript
// src/pages/UserList.tsx
import { Table, Button, Card } from "antd";
import { useRequest } from "ahooks";
import type { ColumnsType } from "antd/es/table";
import { fetchUsers } from "../services/user";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function UserList() {
  const { data, loading, refresh } = useRequest(fetchUsers);

  const columns: ColumnsType<User> = [
    { title: "姓名", dataIndex: "name" },
    { title: "邮箱", dataIndex: "email" },
    {
      title: "操作",
      render: (_, record) => (
        <Button type="link" onClick={() => console.log(record)}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <Card className="m-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">用户列表</h2>
        <Button type="primary" onClick={refresh}>刷新</Button>
      </div>
      <Table columns={columns} dataSource={data} loading={loading} rowKey="id" />
    </Card>
  );
}
```

### 路由配置

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import UserList from "./pages/UserList";
import UserDetail from "./pages/UserDetail";
import { Layout } from "./components/Layout";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={zhCN}>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/users" element={<UserList />} />
              <Route path="/users/:id" element={<UserDetail />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
```

### Zustand 状态管理

```typescript
// src/stores/auth.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AuthState {
  user: { id: string; name: string } | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    user: null,
    token: localStorage.getItem("token"),

    login: async (username, password) => {
      const { data } = await axios.post("/api/login", { username, password });
      localStorage.setItem("token", data.token);
      set({ user: data.user, token: data.token });
    },

    logout: () => {
      localStorage.removeItem("token");
      set({ user: null, token: null });
    },
  }))
);
```

### Jotai 状态管理

```typescript
import { atom, useAtom } from "jotai";

// 原始 atom
export const countAtom = atom(0);

// 只读 atom（派生状态）
export const doubleCountAtom = atom((get) => get(countAtom) * 2);

// 读写 atom（带 action）
export const countWithActionsAtom = atom(
  (get) => get(countAtom),
  (get, set, action: "increment" | "decrement") => {
    if (action === "increment") set(countAtom, get(countAtom) + 1);
  }
);

// 组件中使用
function Counter() {
  const [count, setCount] = useAtom(countAtom);
  const [double] = useAtom(doubleCountAtom);
  return <div onClick={() => setCount((c) => c + 1)}>{count} / {double}</div>;
}
```

### API 服务层

```typescript
// src/services/user.ts
import axios from "axios";
import type { User } from "../types/user";

export async function fetchUsers(): Promise<User[]> {
  const { data } = await axios.get("/api/users");
  return data;
}

export async function fetchUserById(id: string): Promise<User> {
  const { data } = await axios.get(`/api/users/${id}`);
  return data;
}

export async function createUser(input: { name: string; email: string }): Promise<User> {
  const { data } = await axios.post("/api/users", input);
  return data;
}
```

### Ramda 函数式编程（可选）

`ramda` 为可选依赖，按团队偏好引入。适用于复杂数据转换、条件逻辑处理场景。

```typescript
import * as R from "ramda";

// 数据处理管道：筛选活跃用户 → 按创建时间排序 → 取前10 → 提取字段
const processUsers = R.pipe(
  R.filter(R.propEq("active", true)),
  R.sortBy(R.descend(R.prop("createdAt"))),
  R.take(10),
  R.map(R.pick(["id", "name", "email"]))
);

// 安全访问深层路径
const userName = R.path(["user", "profile", "name"], data);

// 条件处理：空值兜底
const getValue = R.ifElse(R.isNil, R.always("default"), R.toUpper);
```

### TailwindCSS 配置

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--ant-color-primary)", // 与 antd 主题色联动
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // 避免与 antd 全局样式冲突
  },
};
```

---

## React 开发规范（强制性）

### 函数式组件原则

- **严格禁止**：class 组件、Component/PureComponent、生命周期方法、`this` 关键字
- **必须使用**：函数组件 `const Comp: React.FC<Props> = () => {...}` + Hooks

### ahooks 生命周期映射

| 传统生命周期 | ahooks 替代 | 说明 |
|-------------|-------------|------|
| componentDidMount | `useMount` | 组件挂载时执行一次 |
| componentWillUnmount | `useUnmount` | 组件卸载时清理 |
| componentDidUpdate | `useUpdateEffect` | 跳过首次渲染的更新效应 |

```typescript
// ❌ 错误：直接用 useEffect
useEffect(() => { fetchData(); }, []);

// ✅ 正确：语义化 useMount
useMount(() => { fetchData(); });

// ❌ 错误：手动管理事件绑定
useEffect(() => {
  window.addEventListener("resize", handler);
  return () => window.removeEventListener("resize", handler);
}, []);

// ✅ 正确：useEventListener
useEventListener("resize", handler, { target: window });
```

### useEffect 使用规范

禁止滥用 `useEffect`。优先按场景使用 ahooks 专用 hooks：

| 场景 | 替代方案 |
|:-----|:---------|
| 数据请求 | `useRequest` / `useAntdTable` |
| 事件监听 | `useEventListener` |
| 防抖/节流 | `useDebounce` / `useThrottleFn` |
| 定时器 | `useInterval` / `useTimeout` |
| 本地存储 | `useLocalStorage` / `useSessionStorage` |
| 键盘事件 | `useKeyPress` |

---

## 常用模式

### 表单 + Modal

```typescript
import { Modal, Form, Input, message } from "antd";
import { useRequest } from "ahooks";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateUserModal({ open, onClose, onSuccess }: CreateUserModalProps) {
  const [form] = Form.useForm();

  const { run, loading } = useRequest(
    (values) => axios.post("/api/users", values),
    {
      manual: true,
      onSuccess: () => {
        message.success("创建成功");
        form.resetFields();
        onSuccess();
        onClose();
      },
    }
  );

  return (
    <Modal
      title="创建用户"
      open={open}
      onOk={form.submit}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Form form={form} onFinish={run} layout="vertical">
        <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="邮箱" rules={[{ required: true, type: "email" }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}
```

### 搜索（防抖）

```typescript
import { Input, Table } from "antd";
import { useRequest, useDebounce } from "ahooks";
import { useState } from "react";
import { searchUsers } from "../services/user";

export default function UserSearch() {
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, { wait: 300 });

  const { data, loading } = useRequest(
    () => searchUsers(debouncedKeyword),
    { refreshDeps: [debouncedKeyword] }
  );

  return (
    <div className="space-y-4">
      <Input.Search
        placeholder="搜索用户..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="max-w-md"
      />
      <Table dataSource={data} loading={loading} rowKey="id" />
    </div>
  );
}
```

### AHooks 常用 Hooks 速查

```typescript
import {
  useRequest,        // 数据请求（自动/手动模式）
  useAntdTable,      // antd Table 分页（自带 refreshDeps）
  useMount,          // 组件挂载
  useUnmount,        // 组件卸载
  useUpdateEffect,   // 更新效应（跳过首次）
  useEventListener,  // 事件监听
  useDebounce,       // 值防抖
  useThrottleFn,     // 函数节流
  useInterval,       // 定时器
  useLocalStorage,   // localStorage 状态同步
  useKeyPress,       // 键盘快捷键
} from "ahooks";
```

---

## 样式规范

### 优先级

1. **antd 组件 API**（`className`、`style` API）— 默认方案
2. **TailwindCSS 工具类** — 布局、间距、响应式等场景
3. **避免手写 CSS 文件或 `<style>` 标签**

### TailwindCSS + Ant Design 结合

```typescript
import { Button, Card, Space } from "antd";

// antd className + TailwindCSS
<Button className="rounded-lg shadow-md hover:shadow-lg">
  按钮
</Button>

// antd 组件 + TailwindCSS 布局
<Card className="p-6">
  <Space direction="vertical" className="w-full">
    <div className="text-lg font-bold">标题</div>
  </Space>
</Card>

// 响应式网格
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</div>
```

---

## 代码规范

### 导入顺序

```typescript
// 1. React
import { useState, useCallback } from "react";
// 2. 第三方库
import { Button, Table } from "antd";
import { useRequest, useMount } from "ahooks";
import { useNavigate } from "react-router-dom";
// 3. 内部组件
import { Layout } from "./components/Layout";
// 4. hooks / stores / services
import { useAuthStore } from "../stores/auth";
import { fetchUsers } from "../services/user";
// 5. 类型
import type { User } from "../types/user";
```

### 命名约定

- **页面组件**：默认导出，`PascalCase` → `export default function UserList()`
- **通用组件**：命名导出，`PascalCase` → `export const UserCard: React.FC<Props>`
- **Hooks**：`useXxx`，文件名 `useCamelCase`
- **Stores**：`useXxxStore`，文件名 `camelCase`
- **Services**：`fetchXxx` / `createXxx` / `updateXxx`
- **类型**：`PascalCase`

---

## 代码审查检查项

- [ ] 是否使用函数组件 + Hooks（禁止 class 组件、this 关键字）
- [ ] 是否使用 TypeScript 严格模式，类型完整
- [ ] 是否使用 ahooks 替代原始 useEffect 生命周期场景
- [ ] 是否有滥用 useEffect（能用 useMount/useEventListener 替代的必须替代）
- [ ] 是否将 API 调用分离到 services 层
- [ ] 是否优先使用 antd className 和 TailwindCSS 而非 style 属性
- [ ] 是否遵循命名约定（页面默认导出、组件命名导出）
- [ ] 列表是否使用唯一且稳定的 `key`（禁止 index）
- [ ] Ramda 使用是否合理（仅用于数据转换，不滥用）
