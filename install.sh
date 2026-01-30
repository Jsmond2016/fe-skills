#!/bin/bash

# Skill 安装脚本
# 支持 Cursor 和 Claude 两个平台

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 配置文件
CONFIG_FILE="$SCRIPT_DIR/skill-config.json"
SOURCES_FILE="$SCRIPT_DIR/skill-sources.json"

# 检查配置文件
if [ ! -f "$CONFIG_FILE" ]; then
  echo -e "${RED}错误: 找不到配置文件 $CONFIG_FILE${NC}"
  exit 1
fi

if [ ! -f "$SOURCES_FILE" ]; then
  echo -e "${RED}错误: 找不到配置文件 $SOURCES_FILE${NC}"
  exit 1
fi

# 解析参数
SKIP_COMMUNITY=false
SKIP_PERSONAL=false
PLATFORM=""
FORCE=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-community)
      SKIP_COMMUNITY=true
      shift
      ;;
    --skip-personal)
      SKIP_PERSONAL=true
      shift
      ;;
    --platform)
      PLATFORM="$2"
      shift 2
      ;;
    --force)
      FORCE=true
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    *)
      echo -e "${RED}未知参数: $1${NC}"
      exit 1
      ;;
  esac
done

# 日志函数
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

# 展开路径中的 ~
expand_path() {
  local path="$1"
  echo "${path/#\~/$HOME}"
}

# 检测平台
detect_platforms() {
  local platforms=()
  
  if [ -d "$HOME/.cursor" ]; then
    platforms+=("cursor")
  fi
  
  if [ -d "$HOME/.claude" ]; then
    platforms+=("claude")
  fi
  
  echo "${platforms[@]}"
}

# 安装个人 skill
install_personal_skill() {
  local skill_name="$1"
  local skill_dir="$SCRIPT_DIR/skills/$skill_name"
  local target_platform="$2"
  local target_path="$3"
  
  if [ ! -d "$skill_dir" ]; then
    log_warn "个人 skill '$skill_name' 不存在，跳过"
    return 1
  fi
  
  if [ ! -f "$skill_dir/SKILL.md" ]; then
    log_warn "个人 skill '$skill_name' 缺少 SKILL.md 文件，跳过"
    return 1
  fi
  
  local target_skill_dir="$target_path/$skill_name"
  
  # 检查是否已存在
  if [ -d "$target_skill_dir" ] && [ "$FORCE" != true ]; then
    log_warn "Skill '$skill_name' 在 $target_platform 已存在，跳过（使用 --force 强制覆盖）"
    return 0
  fi
  
  # 备份现有 skill
  if [ -d "$target_skill_dir" ] && [ "$FORCE" = true ]; then
    local backup_dir="$SCRIPT_DIR/.backups/$target_platform/$skill_name-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$(dirname "$backup_dir")"
    log_info "备份现有 skill 到 $backup_dir"
    cp -r "$target_skill_dir" "$backup_dir"
    rm -rf "$target_skill_dir"
  fi
  
  # 复制 skill
  mkdir -p "$target_path"
  cp -r "$skill_dir" "$target_skill_dir"
  log_success "已安装个人 skill '$skill_name' 到 $target_platform"
}

# 从 GitHub 下载社区 skill
download_community_skill() {
  local skill_name="$1"
  local repo="$2"
  local path="$3"
  local ref="$4"
  local target_path="$5"
  
  local temp_dir=$(mktemp -d)
  local target_skill_dir="$target_path/$skill_name"
  
  # 检查是否已存在
  if [ -d "$target_skill_dir" ] && [ "$FORCE" != true ]; then
    log_warn "社区 skill '$skill_name' 已存在，跳过（使用 --force 强制更新）"
    return 0
  fi
  
  log_info "正在从 GitHub 下载 '$skill_name'..."
  
  # 使用 GitHub API 或 git 下载
  local github_url="https://api.github.com/repos/$repo/contents/$path?ref=$ref"
  
  # 尝试使用 curl 下载（需要 GitHub token 或公开仓库）
  if command -v curl >/dev/null 2>&1; then
    local token="${GITHUB_TOKEN:-}"
    local auth_header=""
    if [ -n "$token" ]; then
      auth_header="-H \"Authorization: token $token\""
    fi
    
    # 下载文件列表
    if curl -s $auth_header "$github_url" > "$temp_dir/contents.json" 2>/dev/null; then
      # 解析 JSON 并下载文件
      if command -v jq >/dev/null 2>&1; then
        # 如果有 jq，解析并下载
        mkdir -p "$target_skill_dir"
        # 简化处理：直接使用 git sparse checkout
        if command -v git >/dev/null 2>&1; then
          cd "$temp_dir"
          git init -q
          git remote add origin "https://github.com/$repo.git" 2>/dev/null || true
          git config core.sparseCheckout true
          echo "$path/*" > .git/info/sparse-checkout
          git pull --depth=1 origin "$ref" -q 2>/dev/null || {
            log_warn "Git 下载失败，尝试直接下载..."
            # 回退方案：直接下载 SKILL.md
            local skill_url="https://raw.githubusercontent.com/$repo/$ref/$path/SKILL.md"
            mkdir -p "$target_skill_dir"
            if curl -sL "$skill_url" > "$target_skill_dir/SKILL.md" 2>/dev/null; then
              log_success "已下载 skill '$skill_name' 的 SKILL.md"
              rm -rf "$temp_dir"
              return 0
            fi
          }
          if [ -d "$path" ]; then
            cp -r "$path"/* "$target_skill_dir/" 2>/dev/null || true
          fi
        fi
      fi
    fi
  fi
  
  # 回退方案：使用 git sparse checkout
  if [ ! -f "$target_skill_dir/SKILL.md" ] && command -v git >/dev/null 2>&1; then
    cd "$temp_dir"
    git init -q
    git remote add origin "https://github.com/$repo.git" 2>/dev/null || true
    git config core.sparseCheckout true
    echo "$path/*" > .git/info/sparse-checkout
    if git pull --depth=1 origin "$ref" -q 2>/dev/null; then
      if [ -d "$path" ]; then
        mkdir -p "$target_path"
        cp -r "$path"/* "$target_skill_dir/" 2>/dev/null || true
      fi
    fi
  fi
  
  # 最终检查
  if [ -f "$target_skill_dir/SKILL.md" ]; then
    log_success "已安装社区 skill '$skill_name'"
    rm -rf "$temp_dir"
    return 0
  else
    log_error "无法下载社区 skill '$skill_name'"
    rm -rf "$temp_dir"
    return 1
  fi
}

# 主安装流程
main() {
  log_info "开始安装 skill..."
  
  # 检测平台
  local detected_platforms=($(detect_platforms))
  if [ ${#detected_platforms[@]} -eq 0 ]; then
    log_error "未检测到 Cursor 或 Claude 平台"
    exit 1
  fi
  
  log_info "检测到平台: ${detected_platforms[*]}"
  
  # 读取配置
  if ! command -v jq >/dev/null 2>&1; then
    log_error "需要安装 jq 来解析 JSON 配置"
    log_info "安装方法: brew install jq (macOS) 或 apt-get install jq (Linux)"
    exit 1
  fi
  
  # 安装个人 skill
  if [ "$SKIP_PERSONAL" != true ]; then
    log_info "安装个人 skill..."
    local personal_skills=$(jq -r '.personal_skills | keys[]' "$CONFIG_FILE" 2>/dev/null)
    
    for skill_name in $personal_skills; do
      local enabled=$(jq -r ".personal_skills[\"$skill_name\"].enabled" "$CONFIG_FILE")
      local platforms=$(jq -r ".personal_skills[\"$skill_name\"].platforms[]" "$CONFIG_FILE")
      
      if [ "$enabled" = "true" ]; then
        for platform in $platforms; do
          if [ -n "$PLATFORM" ] && [ "$platform" != "$PLATFORM" ]; then
            continue
          fi
          
          if [[ " ${detected_platforms[@]} " =~ " ${platform} " ]]; then
            local platform_path=$(jq -r ".platforms[\"$platform\"].path" "$CONFIG_FILE")
            platform_path=$(expand_path "$platform_path")
            install_personal_skill "$skill_name" "$platform" "$platform_path"
          fi
        done
      fi
    done
  fi
  
  # 安装社区 skill
  if [ "$SKIP_COMMUNITY" != true ]; then
    log_info "安装社区 skill..."
    local community_skills=$(jq -r '.community_skills[] | @json' "$SOURCES_FILE" 2>/dev/null)
    
    while IFS= read -r skill_json; do
      local skill_name=$(echo "$skill_json" | jq -r '.name')
      local enabled=$(echo "$skill_json" | jq -r '.enabled')
      local platforms=$(echo "$skill_json" | jq -r '.platforms[]')
      local repo=$(echo "$skill_json" | jq -r '.repo')
      local path=$(echo "$skill_json" | jq -r '.path')
      local ref=$(echo "$skill_json" | jq -r '.ref // "main"')
      
      if [ "$enabled" = "true" ]; then
        for platform in $platforms; do
          if [ -n "$PLATFORM" ] && [ "$platform" != "$PLATFORM" ]; then
            continue
          fi
          
          if [[ " ${detected_platforms[@]} " =~ " ${platform} " ]]; then
            local platform_path=$(jq -r ".platforms[\"$platform\"].path" "$CONFIG_FILE")
            platform_path=$(expand_path "$platform_path")
            download_community_skill "$skill_name" "$repo" "$path" "$ref" "$platform_path"
          fi
        done
      fi
    done <<< "$community_skills"
  fi
  
  log_success "安装完成！"
  log_info "请重启 Cursor 和 Claude 以使 skill 生效"
}

main "$@"
