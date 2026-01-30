#!/bin/bash

# Skill 同步脚本
# 将本地修改同步到 Git 仓库

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 解析参数
AUTO_COMMIT=false
AUTO_PUSH=false
COMMIT_MESSAGE=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --commit)
      AUTO_COMMIT=true
      shift
      ;;
    --push)
      AUTO_PUSH=true
      shift
      ;;
    --message)
      COMMIT_MESSAGE="$2"
      shift 2
      ;;
    *)
      echo -e "${RED}未知参数: $1${NC}"
      exit 1
      ;;
  esac
done

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

main() {
  # 检查是否是 Git 仓库
  if [ ! -d ".git" ]; then
    log_warn "当前目录不是 Git 仓库，初始化 Git 仓库..."
    git init
    log_info "Git 仓库已初始化"
  fi
  
  # 检查是否有变更
  if [ -z "$(git status --porcelain)" ]; then
    log_info "没有变更需要同步"
    return 0
  fi
  
  # 显示变更
  log_info "检测到以下变更："
  git status --short
  
  # 添加变更
  git add -A
  
  # 自动提交
  if [ "$AUTO_COMMIT" = true ]; then
    if [ -z "$COMMIT_MESSAGE" ]; then
      COMMIT_MESSAGE="Update skills: $(date '+%Y-%m-%d %H:%M:%S')"
    fi
    git commit -m "$COMMIT_MESSAGE"
    log_success "已提交变更"
  else
    log_info "使用 --commit 参数自动提交变更"
  fi
  
  # 自动推送
  if [ "$AUTO_PUSH" = true ]; then
    if git remote | grep -q origin; then
      git push
      log_success "已推送到远程仓库"
    else
      log_warn "未配置远程仓库，跳过推送"
    fi
  else
    if [ "$AUTO_COMMIT" = true ]; then
      log_info "使用 --push 参数推送到远程仓库"
    fi
  fi
  
  log_success "同步完成！"
}

main "$@"
