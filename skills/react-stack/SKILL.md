---
name: react-stack
description: React 全栈开发最佳实践 - 整合 React, ahooks, antd, TailwindCSS, Ramda, Jotai, TypeScript, Webpack/Vite, pnpm 等技术栈
---

# React 全栈开发助手

专注于 React 技术栈的开发助手，涵盖组件开发、状态管理、工具函数、构建配置等全链路最佳实践。

## 技术栈

- **框架**: React 18+ (纯函数组件 + Hooks)
- **Hooks 库**: ahooks (React Hooks 库)
- **UI 组件**: Ant Design (antd)
- **状态管理**: Jotai (原子化状态管理)
- **函数式编程**: Ramda
- **HTTP**: axios
- **日期**: dayjs
- **类型**: TypeScript
- **构建**: Webpack + Babel / Vite
- **包管理**: pnpm
- **样式**: TailwindCSS (优先) / SCSS
- **代码质量**: ESLint

## React 开发规范 (强制)

### 函数式开发原则

**严格禁止：**
- 禁止使用 class 组件
- 禁止使用 Component, PureComponent
- 禁止使用 componentDidMount, componentDidUpdate, componentWillUnmount 等生命周期
- 禁止使用 this 关键字
- 禁止使用 useState + useEffect 组合来处理简单的生命周期场景

**必须使用：**
- 只使用函数组件 const Component: React.FC = () => ({...})
- 使用 ahooks 的生命周期 hooks 替代 useEffect
- 使用 TypeScript 定义组件类型

### ahooks 生命周期映射

| 传统生命周期 | ahooks 替代方案 | 说明 |
|-------------|----------------|------|
| componentDidMount | useMount | 组件挂载时执行 |
| componentWillUnmount | useUnmount | 组件卸载时执行 |
| componentDidUpdate | useUpdateEffect | 依赖更新时执行（跳过首次渲染） |

### useEffect 使用规范

```typescript
// 错误：仅挂载时执行应该用 useMount
useEffect(() => {
  fetchData();
}, []);

// 正确：使用 useMount
useMount(() => {
  fetchData();
});

// 错误：简单的事件监听应该用 useEventListener
useEffect(() => {
  const handleClick = () => console.log("click");
  window.addEventListener("click", handleClick);
  return () => window.removeEventListener("click", handleClick);
}, []);

// 正确：使用 useEventListener
useEventListener("click", () => console.log("click"), { target: window });
```

## React 组件标准模板

```typescript
import { Button, Form, Input } from "antd";
import { useRequest, useMount, useUnmount, useUpdateEffect } from "ahooks";
import { useAtom } from "jotai";
import * as R from "ramda";
import dayjs from "dayjs";

interface UserProps {
  id: string;
  onSubmit?: (data: UserData) => void;
}

export const UserProfile: React.FC<UserProps> = ({ id, onSubmit }) => {
  const [count, setCount] = useAtom(countAtom);
  const { data, loading, run } = useRequest(fetchUser, { manual: true });

  useMount(() => {
    console.log("组件挂载");
    run(id);
  });

  useUnmount(() => {
    console.log("组件卸载，清理资源");
  });

  useUpdateEffect(() => {
    console.log("ID 变化:", id);
    run(id);
  }, [id]);

  const handleSubmit = useCallback((values: FormValues) => {
    const processed = R.pipe(
      R.pick(["name", "email"]),
      R.assoc("updatedAt", dayjs().format("YYYY-MM-DD"))
    )(values);
    onSubmit?.(processed);
  }, [onSubmit]);

  return <Form onFinish={handleSubmit}>...</Form>;
};
```

## ahooks 常用 hooks

```typescript
import {
  useRequest,
  useAntdTable,
  useMount,
  useUnmount,
  useUpdateEffect,
  useEventListener,
  useLocalStorage,
  useDebounce,
  useThrottleFn,
  useInterval,
} from "ahooks";

// 数据请求
const { data, loading, refresh } = useRequest(getUserList, {
  debounceWait: 300,
  refreshDeps: [searchKey],
});

// 分页表格
const { tableProps, refresh } = useAntdTable(getTableData, {
  defaultPageSize: 10,
});

// 生命周期
useMount(() => { /* 挂载 */ });
useUnmount(() => { /* 卸载 */ });
useUpdateEffect(() => { /* 更新，跳过首次 */ }, [dep]);

// 事件监听
useEventListener("click", handler, { target: window });

// 本地存储
const [value, setValue] = useLocalStorage("key", defaultValue);
```

## Jotai 状态管理

```typescript
import { atom } from "jotai";

// 原始 atom
export const countAtom = atom(0);

// 只读 atom (派生)
export const doubleCountAtom = atom((get) => get(countAtom) * 2);

// 读写 atom (带 action)
export const countWithActionsAtom = atom(
  (get) => get(countAtom),
  (get, set, action: "increment" | "decrement") => {
    if (action === "increment") set(countAtom, get(countAtom) + 1);
  }
);
```

## Ramda 函数式编程

```typescript
import * as R from "ramda";

// 数据处理管道
const processUsers = R.pipe(
  R.filter(R.propEq("active", true)),
  R.sortBy(R.descend(R.prop("createdAt"))),
  R.take(10),
  R.map(R.pick(["id", "name", "email"]))
);

// 深度路径
const userName = R.path(["user", "profile", "name"], data);

// 条件处理
const getValue = R.ifElse(R.isNil, R.always("default"), R.toUpper);
```

## Ant Design 使用

```typescript
import { Form, Table, Modal, message } from "antd";
import type { TableProps } from "antd";

const columns: TableProps["columns"] = [
  { title: "姓名", dataIndex: "name", sorter: true },
  {
    title: "操作",
    render: (_, record) => (
      <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
    ),
  },
];

const [form] = Form.useForm();
const values = await form.validateFields();
```

## TailwindCSS 样式规范

### 样式优先级

1. **优先使用 Ant Design 默认样式 API**：如 `className`、`style` 等
2. **部分特殊情况使用 TailwindCSS**：当 antd 默认样式无法满足需求时
3. **避免使用 CSS 文件或 style 标签**：优先使用 TailwindCSS 工具类

### TailwindCSS 与 Ant Design 结合使用

```typescript
import { Button, Card, Space } from "antd";

// ✅ 正确：使用 antd 的 className 配合 TailwindCSS
<Button className="rounded-lg shadow-md hover:shadow-lg">
  按钮
</Button>

// ✅ 正确：antd 组件 + TailwindCSS 布局
<Card className="p-6 bg-gradient-to-r from-blue-500 to-purple-500">
  <Space direction="vertical" className="w-full">
    <div className="text-white text-xl font-bold">标题</div>
  </Space>
</Card>

// ❌ 错误：避免直接使用 style 属性
<div style={{ padding: '24px', borderRadius: '8px' }}>...</div>

// ✅ 正确：使用 TailwindCSS 工具类
<div className="p-6 rounded-lg">...</div>
```

### 常用 TailwindCSS 模式

```typescript
// 响应式布局
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</div>

// 间距和布局
<div className="flex items-center justify-between p-4 m-2">
  <span className="text-lg font-semibold">标题</span>
  <Button type="primary">操作</Button>
</div>

// 状态样式
<Button 
  className={`
    transition-all duration-200
    hover:scale-105 active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
  `}
>
  按钮
</Button>

// 自定义颜色（配合 antd 主题）
<div className="bg-blue-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  内容
</div>
```

### TailwindCSS 配置建议

在 `tailwind.config.js` 中配置与 Ant Design 兼容的主题：

```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--ant-color-primary)', // 使用 antd 主题色
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // 禁用 TailwindCSS 的 preflight，避免与 antd 冲突
  },
}
```

## 开发指导原则

1. 只使用函数组件，禁止 class 组件
2. 生命周期使用 ahooks：useMount、useUnmount、useUpdateEffect
3. 避免 useEffect 滥用，优先使用 ahooks 专用 hooks
4. 使用 TypeScript，定义清晰的类型
5. 使用 Jotai 管理状态
6. 使用 Ramda 处理数据
7. 使用 Ant Design 组件
8. 样式优先使用 antd 的 className API，部分特殊情况使用 TailwindCSS 工具类
9. 避免使用 CSS 文件或 style 标签，优先使用 TailwindCSS

## 代码审查检查项

- [ ] 是否使用了 class 组件？改为函数组件
- [ ] 是否使用了 componentDidMount？改为 useMount
- [ ] 是否有 useEffect(() => {}, [])？改为 useMount
- [ ] 是否有简单事件监听 useEffect？改为 useEventListener
- [ ] 是否有 this 关键字？移除
- [ ] 是否使用了 style 属性？改为 TailwindCSS 工具类
- [ ] 是否使用了 CSS 文件？改为 TailwindCSS 或 antd className

