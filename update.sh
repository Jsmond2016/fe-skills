#!/bin/bash

# Skill 更新脚本
# 更新社区 skill 到最新版本

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

SOURCES_FILE="$SCRIPT_DIR/skill-sources.json"
CONFIG_FILE="$SCRIPT_DIR/skill-config.json"

# 解析参数
UPDATE_ALL=false
UPDATE_SKILL=""
CHECK_ONLY=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --all)
      UPDATE_ALL=true
      shift
      ;;
    --skill)
      UPDATE_SKILL="$2"
      shift 2
      ;;
    --check)
      CHECK_ONLY=true
      shift
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

expand_path() {
  local path="$1"
  echo "${path/#\~/$HOME}"
}

# 检查更新
check_updates() {
  local skill_name="$1"
  local repo="$2"
  local path="$3"
  local current_ref="$4"
  
  log_info "检查 '$skill_name' 的更新..."
  
  # 获取最新 commit SHA
  local latest_sha=""
  if command -v curl >/dev/null 2>&1; then
    local token="${GITHUB_TOKEN:-}"
    local auth_header=""
    if [ -n "$token" ]; then
      auth_header="-H \"Authorization: token $token\""
    fi
    
    local api_url="https://api.github.com/repos/$repo/commits?path=$path&sha=main&per_page=1"
    latest_sha=$(curl -s $auth_header "$api_url" | grep -o '"sha":"[^"]*' | head -1 | cut -d'"' -f4)
  fi
  
  if [ -n "$latest_sha" ] && [ "$latest_sha" != "$current_ref" ]; then
    echo "有更新可用: $current_ref -> $latest_sha"
    return 0
  else
    echo "已是最新版本"
    return 1
  fi
}

# 更新 skill
update_skill() {
  local skill_name="$1"
  local repo="$2"
  local path="$3"
  local ref="$4"
  local target_platform="$5"
  local target_path="$6"
  
  log_info "更新 '$skill_name'..."
  
  # 调用 install.sh 的下载函数（简化处理）
  local temp_dir=$(mktemp -d)
  local target_skill_dir="$target_path/$skill_name"
  
  # 备份现有
  if [ -d "$target_skill_dir" ]; then
    local backup_dir="$SCRIPT_DIR/.backups/$target_platform/$skill_name-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$(dirname "$backup_dir")"
    cp -r "$target_skill_dir" "$backup_dir"
    rm -rf "$target_skill_dir"
  fi
  
  # 下载最新版本
  if command -v git >/dev/null 2>&1; then
    cd "$temp_dir"
    git init -q
    git remote add origin "https://github.com/$repo.git" 2>/dev/null || true
    git config core.sparseCheckout true
    echo "$path/*" > .git/info/sparse-checkout
    if git pull --depth=1 origin "$ref" -q 2>/dev/null; then
      if [ -d "$path" ]; then
        mkdir -p "$target_path"
        cp -r "$path"/* "$target_skill_dir/" 2>/dev/null || true
        log_success "已更新 '$skill_name'"
        rm -rf "$temp_dir"
        return 0
      fi
    fi
  fi
  
  log_error "更新 '$skill_name' 失败"
  rm -rf "$temp_dir"
  return 1
}

main() {
  if [ ! -f "$SOURCES_FILE" ]; then
    log_error "找不到配置文件 $SOURCES_FILE"
    exit 1
  fi
  
  if ! command -v jq >/dev/null 2>&1; then
    log_error "需要安装 jq"
    exit 1
  fi
  
  local community_skills=$(jq -r '.community_skills[] | @json' "$SOURCES_FILE")
  local updated_count=0
  
  while IFS= read -r skill_json; do
    local skill_name=$(echo "$skill_json" | jq -r '.name')
    local enabled=$(echo "$skill_json" | jq -r '.enabled')
    local platforms=$(echo "$skill_json" | jq -r '.platforms[]')
    local repo=$(echo "$skill_json" | jq -r '.repo')
    local path=$(echo "$skill_json" | jq -r '.path')
    local ref=$(echo "$skill_json" | jq -r '.ref // "main"')
    
    # 检查是否需要更新这个 skill
    if [ -n "$UPDATE_SKILL" ] && [ "$skill_name" != "$UPDATE_SKILL" ]; then
      continue
    fi
    
    if [ "$UPDATE_ALL" = false ] && [ -z "$UPDATE_SKILL" ]; then
      log_warn "请指定 --all 或 --skill <name>"
      exit 1
    fi
    
    if [ "$enabled" = "true" ]; then
      if [ "$CHECK_ONLY" = true ]; then
        check_updates "$skill_name" "$repo" "$path" "$ref"
      else
        for platform in $platforms; do
          local platform_path=$(jq -r ".platforms[\"$platform\"].path" "$CONFIG_FILE")
          platform_path=$(expand_path "$platform_path")
          
          if update_skill "$skill_name" "$repo" "$path" "$ref" "$platform" "$platform_path"; then
            ((updated_count++))
          fi
        done
      fi
    fi
  done <<< "$community_skills"
  
  if [ "$CHECK_ONLY" != true ]; then
    log_success "更新完成！共更新 $updated_count 个 skill"
    log_info "请重启 Cursor 和 Claude 以使更新生效"
  fi
}

main "$@"
