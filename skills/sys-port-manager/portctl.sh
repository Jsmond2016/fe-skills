#!/usr/bin/env bash
#
# portctl — Cross-platform port manager for macOS & Linux
# Usage: portctl <command> [args]
#

set -euo pipefail

PROG="portctl"
VERSION="1.0.0"

# Detect OS
OS="$(uname -s)"

# ─── Colors ───────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ─── Helpers ──────────────────────────────────────────
has_cmd() {
  command -v "$1" >/dev/null 2>&1
}

print_err() {
  printf "${RED}%s${NC}\n" "$1" >&2
}

print_ok() {
  printf "${GREEN}%s${NC}\n" "$1"
}

print_info() {
  printf "${CYAN}%s${NC}\n" "$1"
}

print_warn() {
  printf "${YELLOW}%s${NC}\n" "$1"
}

# ─── Port validation ──────────────────────────────────
validate_port() {
  local port="$1"
  if [[ -z "$port" ]]; then
    print_err "Error: port number is required"
    return 1
  fi
  if ! [[ "$port" =~ ^[0-9]+$ ]]; then
    print_err "Error: '$port' is not a valid port number"
    return 1
  fi
  if (( port < 1 || port > 65535 )); then
    print_err "Error: port must be between 1 and 65535"
    return 1
  fi
}

# ─── Commands ─────────────────────────────────────────

cmd_list() {
  local filter="${1:-}"

  print_info "Active listening ports:"
  printf "\n"

  if [[ "$OS" == "Linux" ]] && has_cmd ss; then
    # Linux: prefer ss (faster than netstat)
    if [[ -n "$filter" ]]; then
      ss -tlnp "sport = :$filter" 2>/dev/null || true
    else
      ss -tlnp 2>/dev/null | head -50 || true
    fi
  else
    # macOS or Linux without ss: use lsof
    if [[ -n "$filter" ]]; then
      lsof -iTCP:"$filter" -sTCP:LISTEN -P -n 2>/dev/null || true
    else
      lsof -iTCP -sTCP:LISTEN -P -n 2>/dev/null | head -50 || true
    fi
  fi
}

cmd_find() {
  local port="$1"
  validate_port "$port" || return 1

  print_info "Searching for processes on port $port..."
  printf "\n"

  if [[ "$OS" == "Linux" ]] && has_cmd ss; then
    ss -tlnp "sport = :$port" 2>/dev/null || true
    printf "\n"
  fi

  # lsof works on both macOS and Linux
  lsof -i :"$port" -P -n 2>/dev/null || {
    print_warn "No process found on port $port"
    return 0
  }
}

cmd_kill() {
  local port="$1"
  local force="${2:-}"
  validate_port "$port" || return 1

  print_info "Finding processes on port $port..."

  local pids
  pids=$(lsof -ti:"$port" 2>/dev/null || true)

  if [[ -z "$pids" ]]; then
    print_warn "No process found on port $port"
    return 0
  fi

  printf "\n"
  lsof -i :"$port" -P -n 2>/dev/null || true
  printf "\n"

  local sig="TERM"
  local sig_name="gracefully (SIGTERM)"
  if [[ "$force" == "--force" || "$force" == "-f" ]]; then
    sig="KILL"
    sig_name="forcefully (SIGKILL)"
  fi

  if [[ "$force" != "--force" && "$force" != "-f" && -n "$force" ]]; then
    print_err "Unknown option: $force"
    print_err "Usage: portctl kill <port> [--force|-f]"
    return 1
  fi

  print_warn "Killing processes $sig_name: $pids"

  local failed=0
  while IFS= read -r pid; do
    [[ -z "$pid" ]] && continue
    if kill -"$sig" "$pid" 2>/dev/null; then
      print_ok "  Killed PID $pid"
    else
      print_err "  Failed to kill PID $pid (permission denied or already exited)"
      failed=1
    fi
  done <<< "$pids"

  printf "\n"
  if [[ "$failed" -eq 0 ]]; then
    print_ok "Port $port is now free"
  else
    print_warn "Some processes could not be killed. Try: sudo portctl kill $port --force"
    return 1
  fi
}

cmd_info() {
  local port="$1"
  validate_port "$port" || return 1

  print_info "Detailed info for port $port:"
  printf "\n"

  # Process info via lsof
  lsof -i :"$port" -P -n 2>/dev/null || {
    print_warn "No process found on port $port"
    return 0
  }

  printf "\n"

  # Try to show process tree
  local pids
  pids=$(lsof -ti:"$port" 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    print_info "Process tree:"
    while IFS= read -r pid; do
      [[ -z "$pid" ]] && continue
      if has_cmd pstree; then
        pstree -p "$pid" 2>/dev/null || ps -p "$pid" -o pid,ppid,comm,args 2>/dev/null || true
      else
        ps -p "$pid" -o pid,ppid,comm,args 2>/dev/null || true
      fi
    done <<< "$pids"
  fi
}

cmd_usage() {
  cat <<EOF
${CYAN}portctl${NC} $VERSION — Cross-platform port manager

${BLUE}Usage:${NC}
  portctl <command> [args]

${BLUE}Commands:${NC}
  list [port]     List active listening ports (optionally filter by port)
  find <port>     Show processes using a specific port
  kill <port>     Kill processes on a port (SIGTERM, graceful)
  kill <port> -f  Kill processes on a port (SIGKILL, force)
  info <port>     Show detailed process info for a port
  help            Show this help message

${BLUE}Examples:${NC}
  portctl list              # Show all listening ports
  portctl list 3000         # Filter for port 3000
  portctl find 3000         # What's on port 3000?
  portctl kill 3000         # Gracefully kill port 3000
  portctl kill 3000 -f      # Force kill port 3000
  portctl info 3000         # Detailed info about port 3000

${BLUE}Platform:${NC}
  macOS: uses lsof
  Linux: prefers ss, falls back to lsof

${BLUE}Install:${NC}
  chmod +x portctl.sh
  sudo cp portctl.sh /usr/local/bin/portctl
EOF
}

# ─── Main ─────────────────────────────────────────────

main() {
  local cmd="${1:-help}"

  case "$cmd" in
    list|ls)
      shift
      cmd_list "$@"
      ;;
    find|f)
      shift
      if [[ $# -eq 0 ]]; then
        print_err "Usage: portctl find <port>"
        exit 1
      fi
      cmd_find "$1"
      ;;
    kill|k)
      shift
      if [[ $# -eq 0 ]]; then
        print_err "Usage: portctl kill <port> [--force|-f]"
        exit 1
      fi
      cmd_kill "$1" "${2:-}"
      ;;
    info|i)
      shift
      if [[ $# -eq 0 ]]; then
        print_err "Usage: portctl info <port>"
        exit 1
      fi
      cmd_info "$1"
      ;;
    help|--help|-h)
      cmd_usage
      ;;
    version|--version|-v)
      echo "$PROG $VERSION"
      ;;
    *)
      print_err "Unknown command: $cmd"
      cmd_usage
      exit 1
      ;;
  esac
}

main "$@"
