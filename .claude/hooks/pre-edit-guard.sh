#!/bin/bash
# pre-edit-guard.sh — PreToolUse(Edit|MultiEdit|Write) 훅
#
# 1) main 브랜치에서의 파일 편집 차단 (exit 2 → Claude 작업 차단)
# 2) 파일명/경로 컨벤션 검사 (기본: 경고=비차단 / 토글로 차단 전환)
#
# Claude Code 훅 입력은 stdin JSON. 환경변수에 파일 경로가 오지 않는다.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/json.sh"
source "$SCRIPT_DIR/lib/naming-check.sh"

# ── 토글: 컨벤션 위반 시 차단 여부 (1=차단, 0=경고만) ──
NAMING_BLOCK="${CLAUDE_NAMING_BLOCK:-0}"
# ──────────────────────────────────────────────────────

input="$(cat)"
file_path="$(json_get "$input" '.tool_input.file_path')"

# 1) main 브랜치 보호
current_branch="$(git branch --show-current 2>/dev/null)"
if [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
  echo "🚫 '$current_branch' 브랜치에서는 직접 편집할 수 없습니다. 피처 브랜치를 먼저 만드세요 (예: feat/PROJ-123-설명)." >&2
  exit 2
fi

# 2) 컨벤션 검사 (새/수정 파일 경로 대상)
if [ -n "$file_path" ]; then
  # 이미 존재하는 파일의 수정은 파일명 규칙 위반 책임이 이번 편집에 없으므로 완화:
  #   존재하지 않는(=새로 만드는) 파일에만 이름 규칙을 적용한다.
  if [ ! -e "$file_path" ]; then
    violations="$(check_naming "$file_path")"
    if [ -n "$violations" ]; then
      echo "⚠️  컨벤션 점검 ($file_path):" >&2
      echo "$violations" | sed 's/^/   - /' >&2
      echo "   규칙: CONVENTIONS.md 참고. 차단 강제하려면 CLAUDE_NAMING_BLOCK=1." >&2
      if [ "$NAMING_BLOCK" = "1" ]; then
        exit 2
      fi
    fi
  fi
fi

exit 0
