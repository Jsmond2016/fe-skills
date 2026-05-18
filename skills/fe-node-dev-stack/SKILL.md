---
name: fe-node-dev-stack
description: Node.js 后端项目脚手架搭建与开发工作流 — Hono + TypeScript + Zod + Prisma + Redis + Pino。适用于新 API 服务创建、后端功能开发、数据库设计、bug 修复。
---

# Node.js Dev Stack

标准化的 Node.js 后端项目搭建与开发工作流。

## 技术栈

| 类别 | 技术 |
|------|------|
| 运行时 | Node.js + TypeScript（严格模式） |
| 包管理 | pnpm |
| Web 框架 | Hono（轻量、快速、TypeScript 原生） |
| 参数校验 | Zod |
| ORM | Prisma（支持 MySQL / SQLite / PostgreSQL） |
| 缓存 / 队列 | Redis（ioredis） |
| 日志 | Pino |
| 认证 | JWT (jsonwebtoken) |
| 代码质量 | ESLint + Prettier |
| Git 钩子 | Husky + commitlint |
| 提交规范 | Conventional Commits |

## 项目初始化

### 创建新项目

```bash
mkdir project-name && cd project-name
pnpm init
pnpm add -D typescript @types/node tsx
pnpm add hono zod  @hono/zod-validator
pnpm add @prisma/client
pnpm add -D prisma
pnpm add ioredis pino
pnpm add jsonwebtoken
pnpm add -D @types/jsonwebtoken
```

### TypeScript 配置

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

## 项目目录结构

```
src/
├── index.ts           # 入口：创建 Hono app + 启动服务器
├── routes/            # 路由处理器
├── middleware/         # 中间件 (auth, logging, cors, error)
├── services/          # 业务逻辑层
├── validators/        # Zod 校验 Schema
├── lib/               # 客户端初始化 (prisma, redis)
└── types/             # 类型定义
```

## 开发工作流

### 入口文件

```typescript
// src/index.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { errorHandler } from "./middleware/error";
import userRoutes from "./routes/user";

const app = new Hono();

// 全局中间件
app.use("*", cors());
app.use("*", logger());
app.use("*", errorHandler);

// 路由
app.route("/api/users", userRoutes);

// 健康检查
app.get("/api/health", (c) => c.json({ status: "ok", timestamp: Date.now() }));

export default app;
```

### 启动脚本

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:migrate": "prisma migrate dev"
  }
}
```

### 添加新 API 路由

1. 在 `src/validators/` 中定义 Zod 校验 schema
2. 在 `src/routes/` 中创建路由文件
3. 在 `src/index.ts` 注册路由
4. 在 `src/services/` 中实现业务逻辑

### Prisma Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"      // 可选: sqlite, postgresql
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 路由示例

### CRUD 路由

```typescript
// src/routes/user.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const createUserSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
});

const app = new Hono()
  .get("/", async (c) => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return c.json(users);
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const user = await prisma.user.findUnique({ where: { id } });
    return user
      ? c.json(user)
      : c.json({ error: "User not found" }, 404);
  })
  .post("/", zValidator("json", createUserSchema), async (c) => {
    const data = c.req.valid("json");
    const user = await prisma.user.create({ data });
    return c.json(user, 201);
  })
  .patch("/:id", zValidator("json", createUserSchema.partial()), async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");
    const user = await prisma.user.update({ where: { id }, data });
    return c.json(user);
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    await prisma.user.delete({ where: { id } });
    return c.json({ success: true });
  });

export default app;
```

## 中间件

### JWT 认证中间件

```typescript
// src/middleware/auth.ts
import type { MiddlewareHandler } from "hono";
import { jwt } from "hono/jwt";

const SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const jwtMiddleware = jwt({ secret: SECRET });
  return jwtMiddleware(c, next);
};

export function generateToken(payload: Record<string, unknown>): string {
  const { sign } = require("jsonwebtoken");
  return sign(payload, SECRET, { expiresIn: "7d" });
}
```

### 错误处理中间件

```typescript
// src/middleware/error.ts
import type { MiddlewareHandler } from "hono";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next();
  } catch (err) {
    if (err instanceof ZodError) {
      return c.json({ error: "Validation failed", details: err.errors }, 400);
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return c.json({ error: "Unique constraint violation" }, 409);
      }
      if (err.code === "P2025") {
        return c.json({ error: "Record not found" }, 404);
      }
    }
    console.error("Unhandled error:", err);
    return c.json({ error: "Internal Server Error" }, 500);
  }
};
```

## 数据库操作

### Prisma 常用查询

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

// 创建
const user = await prisma.user.create({ data: { name, email } });

// 查询
const user = await prisma.user.findUnique({ where: { id } });
const users = await prisma.user.findMany({ skip: 0, take: 10, orderBy: { createdAt: "desc" } });

// 更新
const user = await prisma.user.update({ where: { id }, data: { name } });

// 删除
await prisma.user.delete({ where: { id } });

// 关联查询
const userWithPosts = await prisma.user.findUnique({
  where: { id },
  include: { posts: true },
});

// 分页
const [total, items] = await Promise.all([
  prisma.user.count({ where: { active: true } }),
  prisma.user.findMany({ skip: 0, take: 20, where: { active: true } }),
]);
```

## Redis 缓存

```typescript
// src/lib/redis.ts
import Redis from "ioredis";
export const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// 使用示例
export async function getCachedUsers() {
  const cacheKey = "users:all";
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const users = await prisma.user.findMany();
  await redis.setex(cacheKey, 300, JSON.stringify(users)); // 5 分钟缓存
  return users;
}
```

## 日志

```typescript
// 使用 Pino 日志
import pino from "pino";
export const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true },
  },
});

logger.info({ userId: "123" }, "User logged in");
logger.error(err, "Failed to process request");
```

## 环境变量

```bash
# .env
DATABASE_URL="mysql://root:password@localhost:3306/project"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
PORT=3000
NODE_ENV=development
```

## 常用模式

### 业务逻辑分层

```typescript
// src/services/user.ts
import { prisma } from "../lib/prisma";
import { redis } from "../lib/redis";

export const userService = {
  async findAll(page = 1, pageSize = 20) {
    const cacheKey = `users:page:${page}:size:${pageSize}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const [items, total] = await Promise.all([
      prisma.user.findMany({ skip: (page - 1) * pageSize, take: pageSize }),
      prisma.user.count(),
    ]);

    const result = { items, total, page, pageSize };
    await redis.setex(cacheKey, 60, JSON.stringify(result));
    return result;
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async create(data: { name: string; email: string }) {
    return prisma.user.create({ data });
  },
};
```

### 批量操作 + 事务

```typescript
await prisma.$transaction([
  prisma.user.update({ where: { id: userId }, data: { name: newName } }),
  prisma.auditLog.create({ data: { action: "UPDATE_USER", userId } }),
]);
```

## 代码审查检查项

- [ ] 所有输入是否经过 Zod 校验
- [ ] API 路由是否注册到 `src/index.ts`
- [ ] 是否正确处理错误边界（Zod, Prisma, 通用）
- [ ] 敏感操作是否添加 JWT 认证中间件
- [ ] 数据库查询是否有合理的索引
- [ ] 缓存是否设置合理的 TTL
- [ ] 业务逻辑是否在 services 层，而非直接写在路由中
- [ ] 环境变量是否通过 `.env` 配置，不硬编码
