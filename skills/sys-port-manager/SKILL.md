---
name: sys-port-manager
description: 跨平台端口管理工具 — 查询、分析、释放端口占用，兼容 macOS 与 Linux。提供 portctl CLI 脚本，支持列表、查找、优雅/强制杀进程等操作。
---

# 端口管理器 (sys-port-manager)

跨平台端口管理工具，统一封装 macOS 与 Linux 的端口查询、占用分析和进程释放操作。

## 快速开始

### 安装 portctl

```bash
# 1. 进入 skill 目录
cd skills/sys-port-manager

# 2. 复制到系统 PATH（推荐）
chmod +x portctl.sh
sudo cp portctl.sh /usr/local/bin/portctl

# 3. 验证
portctl help
```

> 如果不复制到 PATH，可直接 `./portctl.sh <command>` 使用。

### 基本用法

```bash
portctl list              # 列出所有监听端口
portctl list 3000         # 过滤显示端口 3000
portctl find 3000         # 查找占用 3000 端口的进程
portctl kill 3000         # 优雅终止（SIGTERM）
portctl kill 3000 -f      # 强制终止（SIGKILL）
portctl info 3000         # 详细信息（含进程树）
```

## 命令参考

| 命令 | 简写 | 说明 |
|:-----|:-----|:-----|
| `portctl list [port]` | `ls` | 列出监听端口，支持过滤 |
| `portctl find <port>` | `f` | 查找指定端口的占用进程 |
| `portctl kill <port>` | `k` | 优雅终止端口进程 |
| `portctl kill <port> -f` | — | 强制终止端口进程 |
| `portctl info <port>` | `i` | 显示端口详细信息与进程树 |
| `portctl help` | `-h` | 显示帮助 |

## 平台兼容性

| 平台 | 底层工具 | 说明 |
|:-----|:---------|:-----|
| **macOS** | `lsof` | macOS 自带，无需额外安装 |
| **Linux** | `ss` → `lsof` | 优先使用 `ss`（更快），回退 `lsof` |

### 依赖检查

```bash
# macOS
lsof -v

# Linux
ss -V || lsof -v
```

Linux 如果没有 `ss`，安装方式：
```bash
# Debian/Ubuntu
sudo apt-get install iproute2

# RHEL/CentOS/Fedora
sudo dnf install iproute

# Alpine
apk add iproute2
```

## 使用场景

### 场景 1：端口被占，快速释放

```bash
$ portctl kill 3000
Finding processes on port 3000...

COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node     8824   jin   23u  IPv6 0x...      0t0  TCP *:3000 (LISTEN)

Killing processes gracefully (SIGTERM): 8824
  Killed PID 8824

Port 3000 is now free
```

### 场景 2：查看是什么进程占用了端口

```bash
$ portctl info 8080
Detailed info for port 8080:

COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
python   1521   jin    3u  IPv4 0x...      0t0  TCP 127.0.0.1:8080 (LISTEN)

Process tree:
  PID  PPID COMM   ARGS
 1521  1452 python python -m http.server 8080
```

### 场景 3：列出所有前端开发常用端口

```bash
# 查看 3000, 5173, 8080 等常见端口
portctl list 3000
portctl list 5173
portctl list 8080
```

### 场景 4：强制杀进程（权限不足时）

```bash
# 普通权限无法终止时
sudo portctl kill 80 -f
```

## 在 Claude Code 中使用

当用户提到端口占用、进程释放、端口查询等需求时，主动使用本 skill 提供的能力：

1. **推荐用户安装 portctl**（如果尚未安装）
2. **直接生成对应命令**让用户执行
3. **解释命令输出**帮助用户理解端口占用情况

### 对话示例

**用户**：3000 端口被占了，怎么查是什么进程？

**Claude**：可以用 portctl 查看：
```bash
portctl find 3000
```
如果确认要释放：
```bash
portctl kill 3000
```

**用户**：kill 不掉，说 permission denied

**Claude**：需要 sudo 强制终止：
```bash
sudo portctl kill 3000 -f
```
`-f` 参数发送 SIGKILL，系统级强制终止。

## 注意事项

- `kill` 默认使用 **SIGTERM**（优雅终止），进程有机会清理资源
- `kill -f` 使用 **SIGKILL**（强制终止），立即结束，无清理机会
- 系统服务占用低端口（如 80, 443）时通常需要 `sudo`
- 生产环境慎用 `-f`，可能导致数据丢失或服务状态不一致

## 故障排除

| 问题 | 原因 | 解决 |
|:-----|:-----|:-----|
| `portctl: command not found` | 未加入 PATH | 检查安装步骤，或直接用 `./portctl.sh` |
| `No process found` | 端口确实未占用 | 确认端口号正确 |
| `permission denied` | 非 root 杀系统进程 | 使用 `sudo` |
| `lsof: command not found` | 最小化 Linux 系统 | 安装 `lsof` 或 `iproute2` |

## 相关命令对照

如果你更喜欢原生命令，portctl 的底层等价操作：

```bash
# macOS
lsof -i :3000              # 查找
lsof -ti :3000 | xargs kill -9   # 强制杀

# Linux
ss -tlnp | grep 3000       # 查找
fuser -k 3000/tcp          # 杀进程
```
