#!/bin/bash
# pm-detect.sh — 락파일 기반 패키지 매니저 / 포맷터 감지
#
# 다른 훅에서 `source` 해서 detect_pm / detect_formatter 를 사용한다.
# 락파일이 없으면 bun(모노레포는 pnpm) / prettier 로 폴백한다.

# 프로젝트 루트에서 사용할 패키지 매니저를 감지한다.
# 우선순위: ① 락파일(기존 프로젝트 존중) → ② 락파일 없고 모노레포면 pnpm → ③ 그 외 기본 bun.
detect_pm() {
  local dir="${1:-$PWD}"

  # ① 락파일 우선 (기존 프로젝트 존중)
  if [ -f "$dir/pnpm-lock.yaml" ]; then echo "pnpm"; return; fi
  if [ -f "$dir/yarn.lock" ]; then echo "yarn"; return; fi
  if [ -f "$dir/bun.lockb" ] || [ -f "$dir/bun.lock" ]; then echo "bun"; return; fi
  if [ -f "$dir/package-lock.json" ]; then echo "npm"; return; fi

  # ② 락파일 없음 — 모노레포면 pnpm (pnpm workspace / turbo / nx / lerna / package.json workspaces)
  if [ -f "$dir/pnpm-workspace.yaml" ] || [ -f "$dir/turbo.json" ] \
     || [ -f "$dir/nx.json" ] || [ -f "$dir/lerna.json" ] \
     || { [ -f "$dir/package.json" ] && grep -q '"workspaces"' "$dir/package.json" 2>/dev/null; }; then
    echo "pnpm"; return
  fi

  # ③ 그 외 기본값 bun
  echo "bun"
}

# 패키지 매니저별 스크립트 실행 프리픽스 ("pnpm" / "yarn" / "bun run" / "npm run")
pm_run() {
  local pm
  pm="$(detect_pm "$1")"
  case "$pm" in
    yarn) echo "yarn" ;;
    pnpm) echo "pnpm" ;;
    bun)  echo "bun run" ;;
    *)    echo "npm run" ;;
  esac
}

# 패키지 매니저별 일회성 실행기 (npx 대응): "pnpm dlx" / "yarn dlx" / "bunx" / "npx"
pm_dlx() {
  local pm
  pm="$(detect_pm "$1")"
  case "$pm" in
    pnpm) echo "pnpm dlx" ;;
    yarn) echo "yarn dlx" ;;
    bun)  echo "bunx" ;;
    *)    echo "npx" ;;
  esac
}

# 사용할 포맷터를 감지한다. biome 설정이 있으면 biome, 아니면 prettier.
detect_formatter() {
  local dir="${1:-$PWD}"
  if [ -f "$dir/biome.json" ] || [ -f "$dir/biome.jsonc" ]; then echo "biome"
  else echo "prettier"; fi
}
