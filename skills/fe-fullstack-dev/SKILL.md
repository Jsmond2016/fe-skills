---
name: fe-fullstack-dev
description: Full Stack monorepo project scaffolding and development using pnpm workspaces — React frontend (Vite + TypeScript + Tailwind + antd) with Node.js backend (Hono + Zod + Prisma + Redis). Use for new full stack projects, monorepo setup, or any project needing frontend + backend code.
---

# Full Stack Monorepo

Combines React frontend and Hono backend into a pnpm workspace monorepo with shared types and utilities.

## Project Structure

```
project-name/
├── web/                    # 前端: React + Vite + TypeScript + Tailwind + antd
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── stores/
│   │   └── services/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
├── server/                 # 后端: Hono + TypeScript + Zod + Prisma + Redis
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── validators/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── packages/
│   └── shared/             # 共享类型、校验 Schema、工具函数
│       ├── src/
│       │   ├── types/
│       │   └── validators/
│       └── package.json
├── pnpm-workspace.yaml
└── package.json
```

## Configuration

### pnpm-workspace.yaml

```yaml
packages:
  - "web"
  - "server"
  - "packages/*"
```

### Root package.json

```json
{
  "name": "project-name",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel -r dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "clean": "pnpm -r clean"
  }
}
```

### Vite proxy config (web/vite.config.ts)

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
```

### Shared package (packages/shared)

```typescript
// packages/shared/src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// packages/shared/src/validators/user.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

## Development Workflow

### Start dev servers

```bash
pnpm dev                          # web + server 同时启动（并行）
pnpm --filter web dev             # 只启动前端 (localhost:5173)
pnpm --filter server dev          # 只启动后端 (localhost:3000)
```

### Add dependencies

```bash
pnpm add antd --filter web                        # 前端依赖
pnpm add @hono/zod-validator --filter server      # 后端依赖
pnpm add zod --filter @project/shared -w          # 共享包依赖（-w 表示 workspace root）
pnpm add -D typescript -w                         # 根项目开发依赖
```

### Inter-package imports

```typescript
// web/src/services/user.ts
import type { User, CreateUserInput } from "@project/shared";

// server/src/routes/user.ts
import { createUserSchema } from "@project/shared";
import type { User } from "@project/shared";
```

### Database operations (Prisma)

```bash
pnpm --filter server prisma generate     # 生成 Prisma Client
pnpm --filter server prisma db push      # 同步 Schema 到数据库
pnpm --filter server prisma studio       # 打开数据库 GUI
pnpm --filter server prisma migrate dev  # 创建迁移
```

## Backend API Example (Hono)

```typescript
// server/src/routes/user.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createUserSchema } from "@project/shared";
import { prisma } from "../lib/prisma";

const app = new Hono()
  .get("/users", async (c) => {
    const users = await prisma.user.findMany();
    return c.json(users);
  })
  .post("/users", zValidator("json", createUserSchema), async (c) => {
    const data = c.req.valid("json");
    const user = await prisma.user.create({ data });
    return c.json(user, 201);
  })
  .get("/users/:id", async (c) => {
    const id = c.req.param("id");
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? c.json(user) : c.json({ error: "Not found" }, 404);
  });

export default app;
```

## Frontend API Call Example

```typescript
// web/src/services/user.ts
import axios from "axios";
import type { User } from "@project/shared";

export async function fetchUsers(): Promise<User[]> {
  const { data } = await axios.get("/api/users");
  return data;
}

export async function createUser(input: { name: string; email: string }): Promise<User> {
  const { data } = await axios.post("/api/users", input);
  return data;
}

// web/src/hooks/useUsers.ts
import { useRequest } from "ahooks";
import { fetchUsers, createUser } from "../services/user";

export function useUsers() {
  const { data, loading, error, refresh } = useRequest(fetchUsers);
  return { users: data, loading, error, refresh };
}

export function useCreateUser() {
  const { run, loading } = useRequest(createUser, { manual: true });
  return { createUser: run, creating: loading };
}
```

## Common Patterns

### Add a new API endpoint

1. Define validator schema in `server/src/validators/` (or `packages/shared/`)
2. Create route handler in `server/src/routes/`
3. Register route in `server/src/index.ts`
4. Add frontend service function in `web/src/services/`
5. Update shared types in `packages/shared/src/types/`

### Error handling

```typescript
// server/src/middleware/error.ts
import type { MiddlewareHandler } from "hono";

export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next();
  } catch (err) {
    console.error("Unhandled error:", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};
```

## Code Review Checklist

- [ ] `pnpm-workspace.yaml` 是否包含所有子包
- [ ] Vite proxy 配置是否指向正确的后端地址
- [ ] 跨包引用是否使用 workspace protocol (`workspace:*`)
- [ ] 共享类型是否定义在 `packages/shared` 而非各自复制
- [ ] API 路径是否统一使用 `/api` 前缀
- [ ] Prisma schema 变更是否已生成迁移
