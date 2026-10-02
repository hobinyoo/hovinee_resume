#!/bin/bash
# json.sh — Claude Code 훅 입력(stdin JSON)에서 값을 뽑는 헬퍼
#
# Claude Code는 훅에 도구 정보를 stdin JSON으로 전달한다. (환경변수 아님!)
# 예: {"tool_name":"Edit","tool_input":{"file_path":"src/a.ts",...}, ...}
#
# 사용:
#   input="$(cat)"
#   file_path="$(json_get "$input" '.tool_input.file_path')"
#
# jq가 있으면 jq를, 없으면 node를 사용한다. 둘 다 없으면 빈 문자열.

json_get() {
  local data="$1" query="$2"
  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$data" | jq -r "$query // empty" 2>/dev/null
  elif command -v node >/dev/null 2>&1; then
    # jq 경로 표현식을 node에서 해석 (단순 .a.b.c 형태만 지원 — 훅 용도로 충분)
    printf '%s' "$data" | node -e '
      let raw = "";
      process.stdin.on("data", c => raw += c);
      process.stdin.on("end", () => {
        try {
          const obj = JSON.parse(raw);
          const path = process.argv[1].replace(/^\./, "").split(".").filter(Boolean);
          let cur = obj;
          for (const k of path) { cur = cur == null ? undefined : cur[k]; }
          process.stdout.write(cur == null ? "" : String(cur));
        } catch (_) { /* 조용히 빈 값 */ }
      });
    ' "$query" 2>/dev/null
  else
    printf ''
  fi
}
