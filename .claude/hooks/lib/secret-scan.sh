#!/bin/bash
# secret-scan.sh — 편집된 파일에 시크릿/자격증명이 하드코딩됐는지 검사
#
# 사용: scan_secrets "<파일경로>"
#   - 의심 라인을 stdout 한 줄씩 출력, 발견 시 반환코드 1
#   - 없으면 아무것도 출력 안 하고 0
#
# 프론트엔드 특성상 VITE_ 접두(클라이언트 노출) 환경변수에 비밀값을 넣는 오용도 함께 잡는다.

scan_secrets() {
  local file="$1"
  [ -n "$file" ] && [ -f "$file" ] || return 0

  # 텍스트 파일만
  case "$file" in
    *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.json|*.env*|*.yml|*.yaml) : ;;
    *) return 0 ;;
  esac

  local hits=0

  # 패턴: "설명|정규식" (grep -E)
  # 참고: 마지막 범용 패턴은 의도적으로 보수적이라 `const token = getAuthToken()` 같은 함수 호출도
  #       오탐할 수 있다. 모든 경고는 비차단(exit 0 계열)이므로 실제 커밋을 막지는 않는다.
  local patterns=(
    "AWS Access Key|AKIA[0-9A-Z]{16}"
    "OpenAI/유사 키|sk-[A-Za-z0-9]{20,}"
    "GitHub 토큰|ghp_[A-Za-z0-9]{36}"
    "Slack 토큰|xox[baprs]-[A-Za-z0-9-]{10,}"
    "Google API 키|AIza[0-9A-Za-z_-]{35}"
    "Private Key 블록|-----BEGIN [A-Z ]*PRIVATE KEY-----"
    "하드코딩된 비밀번호/시크릿|(password|passwd|secret|api[_-]?key|token)[\"'\''[:space:]]*[:=][\"'\''[:space:]]*[A-Za-z0-9/+=_-]{8,}"
  )

  local p desc regex line
  for p in "${patterns[@]}"; do
    desc="${p%%|*}"
    regex="${p#*|}"
    while IFS= read -r line; do
      [ -n "$line" ] && { echo "[$desc] $line"; hits=1; }
    done < <(grep -nEi "$regex" "$file" 2>/dev/null | head -5)
  done

  # VITE_ 에 secret/key/token/password 가 붙은 변수명 (클라이언트 번들 노출 위험)
  while IFS= read -r line; do
    [ -n "$line" ] && { echo "[VITE_ 에 비밀값 의심 — 클라이언트 노출] $line"; hits=1; }
  done < <(grep -nEi "VITE_[A-Z0-9_]*(SECRET|KEY|TOKEN|PASSWORD|PRIVATE)" "$file" 2>/dev/null | head -5)

  return $hits
}
