---
name: fe-react-dev-stack
description: React + TypeScript 项目脚手架搭建与开发工作流 — Vite + React 19 + TypeScript + TailwindCSS + antd + Zustand/Jotai + ahooks + React Router 7。适用于新 React 项目创建、现有项目维护、功能开发与重构。
---

# React Dev Stack

标准化的 React 项目搭建与开发工作流。

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

# 状态管理
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

# 代码质量
pnpm add -D eslint prettier eslint-config-prettier
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional
npx husky init
```

## 项目目录结构

```
src/
├── components/       # 通用组件
├── pages/            # 页面组件（默认导出）
├── hooks/            # 自定义 hooks
├── stores/           # Zustand stores
├── services/         # API 请求层
├── utils/            # 工具函数
├── types/            # TypeScript 类型定义
├── App.tsx           # 路由配置
└── main.tsx          # 入口
```

## 开发工作流

### 创建新页面

1. 在 `src/pages/` 中创建页面组件
2. 在 `src/App.tsx` 中添加路由
3. 使用 antd 组件 + TailwindCSS 构建 UI
4. 通过 Zustand 管理状态

```typescript
// src/pages/UserList.tsx
import { Table, Button, Card } from "antd";
import { useMount, useRequest } from "ahooks";
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
        <Button type="primary" onClick={refresh}>
          刷新
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
      />
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

### TailwindCSS 配置

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--ant-color-primary)",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // 避免与 antd 冲突
  },
};
```

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

### 使用 ahooks 处理搜索

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

- 页面组件：默认导出，文件名为 `PascalCase`
- 通用组件：命名导出，文件名为 `PascalCase`
- Hooks：`useXxx`，文件名为 `useCamelCase`
- Stores：`useXxxStore`，文件名为 `camelCase`
- Services：`fetchXxx` / `createXxx` / `updateXxx`
- 类型：`PascalCase`

## 代码审查检查项

- [ ] 是否使用函数组件 + Hooks（禁止 class 组件）
- [ ] 是否使用 TypeScript 严格模式
- [ ] 是否优先使用 antd 的 className 而非 style 属性
- [ ] 是否使用 ahooks 替代原始 useEffect 生命周期场景
- [ ] 是否遵循命名约定（页面默认导出、组件命名导出）
- [ ] 是否将 API 调用分离到 services 层
- [ ] 是否使用 TailwindCSS 工具类而非手写 CSS
