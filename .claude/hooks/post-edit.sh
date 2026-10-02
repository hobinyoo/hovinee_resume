#!/bin/bash
# post-edit.sh — PostToolUse(Edit|MultiEdit|Write) 통합 디스패처
#
# 저장된 파일 하나에 대해 포맷터를 실행한다. (전체 프로젝트 tsc는 여기서 하지 않음 —
# 느려지므로 /code-quality 커맨드나 CI로 이관.)
#
# - JS/TS/CSS 파일만 대상
# - 패키지 매니저/포맷터는 락파일·설정으로 감지 (npm 하드코딩 금지)
# - 비차단: 실패해도 exit 0 (편집 자체를 막지 않음)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/json.sh"
source "$SCRIPT_DIR/lib/pm-detect.sh"
source "$SCRIPT_DIR/lib/secret-scan.sh"

input="$(cat)"
file_path="$(json_get "$input" '.tool_input.file_path')"

# 대상 파일 없으면 조용히 종료
[ -n "$file_path" ] || exit 0
[ -f "$file_path" ] || exit 0

# 포맷 대상 확장자만
case "$file_path" in
  *.ts|*.tsx|*.js|*.jsx|*.css|*.scss|*.json|*.md) : ;;
  *) exit 0 ;;
esac

project_dir="${CLAUDE_PROJECT_DIR:-$PWD}"

# 1) 포맷 (감지된 formatter/PM)
formatter="$(detect_formatter "$project_dir")"
dlx="$(pm_dlx "$project_dir")"
if [ "$formatter" = "biome" ]; then
  $dlx @biomejs/biome format --write "$file_path" >/dev/null 2>&1
else
  # prettier: 설정이 없어도 기본값으로 동작. 미설치 등 실패는 무시.
  $dlx prettier --write "$file_path" >/dev/null 2>&1
fi

# 2) 시크릿 스캔 (보안 — 발견 시 stderr 경고, 비차단)
secret_hits="$(scan_secrets "$file_path")"
if [ -n "$secret_hits" ]; then
  echo "🔒 시크릿 의심 ($file_path): 하드코딩된 자격증명이 있는지 확인하세요." >&2
  echo "$secret_hits" | sed 's/^/   /' >&2
fi

# (import 순서는 Biome organizeImports 가 처리하므로 별도 훅 없음)

# 항상 비차단 (편집 자체를 막지 않음)
exit 0
