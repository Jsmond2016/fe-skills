#!/bin/bash
# AfterToolCall hook — check for large JS/TS/JSX/TSX/Vue files exceeding 450 lines
# Installed by fe-skills project. When a large file is detected, a warning is
# emitted so the conversation can suggest running /fe-large-file-refactor.
#
# Dedup mechanism: tracks warned files in a temp file, re-warns only after
# the file has been modified since last warning, or after 1 hour.

MAX_LINES=450
CACHE_DIR="${CLAUDE_CACHE_DIR:-/tmp/claude-hooks}"
CACHE_FILE="${CACHE_DIR}/large-file-refactor-warned"
mkdir -p "${CACHE_DIR}"
touch "${CACHE_FILE}"

workspace="${PWD}"

# Only scan the workspace (not the whole filesystem)
find "${workspace}" -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.vue" \) \
  ! -path "*/node_modules/*" \
  ! -path "*/dist/*" \
  ! -path "*/build/*" \
  ! -path "*/.git/*" \
  ! -path "*/coverage/*" \
  ! -path "*.min.*" 2>/dev/null \
  | while read -r file; do

  lines=$(wc -l < "${file}" 2>/dev/null || echo 0)
  if [ "${lines}" -le "${MAX_LINES}" ]; then
    continue
  fi

  rel_path="${file#${workspace}/}"
  mtime=$(stat -f "%m" "${file}" 2>/dev/null || echo "0")

  # Check cache: skip if we already warned and file hasn't changed
  cached=$(grep "^${rel_path}|" "${CACHE_FILE}" 2>/dev/null | tail -1)
  if [ -n "${cached}" ]; then
    cached_mtime="${cached##*|}"
    if [ "${mtime}" -le "${cached_mtime}" ] 2>/dev/null; then
      continue
    fi
  fi

  # Record this warning
  sed -i '' "/^${rel_path}|/d" "${CACHE_FILE}" 2>/dev/null || true
  echo "${rel_path}|${mtime}" >> "${CACHE_FILE}"

  printf '⚠️  [large-file-refactor] `%s` 当前 %s 行（超过 %s 行限制），建议运行 /fe-large-file-refactor 进行重构拆分\n' "${rel_path}" "${lines}" "${MAX_LINES}"
done
