---
name: fe-tailwindcss
description: TailwindCSS utility-first CSS framework for rapid UI development. Use when styling components, configuring TailwindCSS, working with utility classes, or integrating with React/Ant Design projects.
---

# TailwindCSS 开发指南

TailwindCSS 是一个实用优先的 CSS 框架，通过工具类快速构建现代 UI。

## 核心概念

- **实用优先**：使用预定义的实用类而不是自定义 CSS
- **响应式设计**：使用前缀 `sm:`, `md:`, `lg:`, `xl:`, `2xl:` 实现响应式
- **状态变体**：使用 `hover:`, `focus:`, `active:`, `disabled:` 等处理交互状态
- **暗色模式**：使用 `dark:` 前缀支持暗色主题

## 安装与配置

### Vite 项目安装

```bash
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 配置文件示例

`tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--ant-color-primary)', // 与 Ant Design 集成
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // 与 Ant Design 一起使用时禁用 preflight
  },
}
```

### CSS 入口文件

在 `src/index.css` 或 `src/main.css` 中：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 常用工具类

### 布局

```typescript
// Flexbox
<div className="flex items-center justify-between">
<div className="flex flex-col gap-4">
<div className="flex-1">占满剩余空间</div>

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
<div className="grid grid-cols-12 gap-4">

// 定位
<div className="relative">
  <div className="absolute top-0 right-0">绝对定位</div>
</div>
```

### 间距

```typescript
// Padding
<div className="p-4">padding: 1rem</div>
<div className="px-6 py-4">padding-x: 1.5rem, padding-y: 1rem</div>
<div className="pt-2 pb-4 pl-6 pr-8">各方向独立设置</div>

// Margin
<div className="m-4">margin: 1rem</div>
<div className="mx-auto">水平居中</div>
<div className="mt-8 mb-4">上下间距</div>

// Gap (用于 flex/grid)
<div className="flex gap-2 gap-x-4 gap-y-6">
```

### 尺寸

```typescript
// 宽度
<div className="w-full w-1/2 w-64 w-screen">
<div className="min-w-0 max-w-4xl">

// 高度
<div className="h-full h-screen h-96 min-h-screen">

// 尺寸
<div className="w-12 h-12">正方形</div>
```

### 文字样式

```typescript
// 字体大小
<div className="text-xs text-sm text-base text-lg text-xl text-2xl">

// 字重
<div className="font-normal font-medium font-semibold font-bold">

// 对齐
<div className="text-left text-center text-right text-justify">

// 颜色
<div className="text-gray-900 text-blue-600 text-red-500">
<div className="text-white dark:text-gray-100">

// 行高
<div className="leading-tight leading-normal leading-relaxed">

// 截断
<div className="truncate">单行截断</div>
<div className="line-clamp-2">多行截断（2行）</div>
```

### 背景与边框

```typescript
// 背景
<div className="bg-white bg-gray-100 bg-blue-500">
<div className="bg-gradient-to-r from-blue-500 to-purple-500">
<div className="bg-opacity-50">背景透明度</div>

// 边框
<div className="border border-gray-300 border-2 border-blue-500">
<div className="rounded rounded-lg rounded-full">
<div className="border-t border-b border-l-0 border-r-0">

// 阴影
<div className="shadow shadow-md shadow-lg shadow-xl">
<div className="shadow-none">无阴影</div>
```

### 响应式设计

```typescript
// 断点前缀
<div className="
  text-sm 
  md:text-base 
  lg:text-lg 
  xl:text-xl
">

<div className="
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  xl:grid-cols-4
">

// 显示/隐藏
<div className="hidden md:block">移动端隐藏，桌面端显示</div>
<div className="block md:hidden">移动端显示，桌面端隐藏</div>
```

### 状态变体

```typescript
// Hover
<button className="hover:bg-blue-600 hover:text-white hover:shadow-lg">

// Focus
<input className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500">

// Active
<button className="active:scale-95 active:bg-blue-700">

// Disabled
<button className="disabled:opacity-50 disabled:cursor-not-allowed">

// 组合
<button className="
  transition-all duration-200
  hover:scale-105 hover:shadow-md
  active:scale-95
  disabled:opacity-50 disabled:cursor-not-allowed
">
```

### 过渡动画

```typescript
// 过渡
<div className="transition transition-all transition-colors transition-opacity">

// 持续时间
<div className="duration-150 duration-200 duration-300 duration-500">

// 缓动函数
<div className="ease-in ease-out ease-in-out">

// 延迟
<div className="delay-75 delay-100 delay-150">

// Transform
<div className="transform hover:scale-110 hover:rotate-3">
<div className="translate-x-4 translate-y-2">
```

## 与 Ant Design 集成

### 最佳实践

1. **优先使用 antd 的 className API**：antd 组件支持 `className` 属性
2. **禁用 TailwindCSS preflight**：避免与 antd 样式冲突
3. **使用 CSS 变量**：在 TailwindCSS 配置中使用 antd 的主题变量

### 示例

```typescript
import { Button, Card, Space } from "antd";

// ✅ 正确：antd 组件 + TailwindCSS 工具类
<Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
  <Space direction="vertical" className="w-full gap-4">
    <div className="text-xl font-bold text-gray-900">标题</div>
    <Button 
      type="primary" 
      className="w-full hover:scale-105 transition-transform"
    >
      按钮
    </Button>
  </Space>
</Card>

// ✅ 正确：响应式布局
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id} className="hover:shadow-lg transition-shadow">
      {item.content}
    </Card>
  ))}
</div>

// ✅ 正确：自定义样式补充 antd
<Button 
  className="
    rounded-full 
    shadow-md 
    hover:shadow-lg 
    transition-all 
    duration-200
    hover:scale-105
    active:scale-95
  "
>
  自定义按钮
</Button>
```

## 自定义工具类

### 在配置中扩展

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
}
```

### 使用 @apply 指令

```css
/* 在 CSS 文件中 */
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded-lg;
    @apply hover:bg-blue-600 focus:ring-2 focus:ring-blue-500;
    @apply transition-all duration-200;
  }
  
  .card-custom {
    @apply p-6 bg-white rounded-lg shadow-md;
    @apply hover:shadow-lg transition-shadow;
  }
}
```

## 性能优化

### 内容扫描配置

确保 `tailwind.config.js` 的 `content` 数组包含所有需要扫描的文件：

```javascript
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
  // 如果使用其他目录
  "./components/**/*.{js,ts,jsx,tsx}",
]
```

### 生产构建

TailwindCSS 会自动移除未使用的样式，确保：

1. 正确配置 `content` 路径
2. 使用完整的类名（避免动态拼接）
3. 如需动态类名，使用 `safelist` 配置

```javascript
// tailwind.config.js
export default {
  safelist: [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    // 动态生成的类名
  ],
}
```

## 常见模式

### 卡片组件

```typescript
<div className="
  bg-white 
  rounded-lg 
  shadow-md 
  p-6 
  hover:shadow-lg 
  transition-shadow
  cursor-pointer
">
  卡片内容
</div>
```

### 按钮变体

```typescript
const buttonVariants = {
  primary: "bg-blue-500 text-white hover:bg-blue-600",
  secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
  danger: "bg-red-500 text-white hover:bg-red-600",
};

<button className={`px-4 py-2 rounded-lg transition-colors ${buttonVariants.primary}`}>
  按钮
</button>
```

### 加载状态

```typescript
<button 
  disabled={loading}
  className="
    px-4 py-2 rounded-lg
    disabled:opacity-50 
    disabled:cursor-not-allowed
    transition-opacity
  "
>
  {loading ? '加载中...' : '提交'}
</button>
```

### 表单布局

```typescript
<div className="space-y-4">
  <div className="flex flex-col gap-2">
    <label className="text-sm font-medium text-gray-700">标签</label>
    <input className="
      px-3 py-2 
      border border-gray-300 
      rounded-lg 
      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      transition-all
    " />
  </div>
</div>
```

## 调试技巧

### 查看生成的 CSS

在开发模式下，TailwindCSS 会生成所有工具类的 CSS。使用浏览器开发者工具检查元素，查看应用的类名。

### 类名冲突

如果遇到样式不生效：

1. 检查类名拼写是否正确
2. 确认 `content` 配置包含该文件
3. 检查是否有 CSS 优先级冲突
4. 使用 `!important` 修饰符（不推荐）：`!bg-blue-500`

### 常用调试类

```typescript
// 临时添加边框查看布局
<div className="border border-red-500">调试</div>

// 查看间距
<div className="bg-blue-100 p-4 m-2">查看 padding 和 margin</div>
```

## 参考资源

- [TailwindCSS 官方文档](https://tailwindcss.com/docs)
- [TailwindCSS 工具类速查表](https://tailwindcss.com/docs/utility-first)
- [TailwindCSS 与 React 集成](https://tailwindcss.com/docs/guides/vite)
