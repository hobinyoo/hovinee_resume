#!/bin/bash
# naming-check.sh — 파일명/경로가 팀 컨벤션(CONVENTIONS.md)에 맞는지 검증
#
# 사용: check_naming "<파일경로>"
#   - 위반 사유를 stdout 한 줄씩 출력하고, 위반이 있으면 반환코드 1
#   - 위반이 없으면 아무것도 출력하지 않고 반환코드 0
#
# 규칙 요약:
#   - 파일명/폴더명은 kebab-case
#   - TanStack Router 특수 파일 및 src/routes/ 하위(라우터 문법)는 예외
#   - 단일 파일의 동일명 1뎁스 중첩(x/x.tsx 만 존재)은 경고
#
# ── 프로젝트별 조정 지점 ─────────────────────────────────────────────
# TanStack Router 특수 파일 (kebab 검사 제외). src/routes/ 하위는 아래에서 통째로 예외 처리.
SPECIAL_FILES="__root route index"
# 검사 대상 확장자
CHECK_EXT="ts tsx js jsx css scss"
# ────────────────────────────────────────────────────────────────────

# 단일 세그먼트가 kebab-case 인지 검사 (소문자/숫자 + 하이픈, 점 확장자 허용)
_is_kebab_segment() {
  # 허용: a, a-b, a-b-c, use-auth, user-card.tsx, my.config.ts
  #   각 '.' 구분 조각이 [a-z0-9]+(-[a-z0-9]+)* 여야 함
  local seg="$1" part
  IFS='.' read -ra parts <<< "$seg"
  for part in "${parts[@]}"; do
    [ -z "$part" ] && return 1
    [[ "$part" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || return 1
  done
  return 0
}

check_naming() {
  local path="$1"
  local violations=0

  [ -z "$path" ] && return 0

  local base ext name
  base="$(basename "$path")"
  ext="${base##*.}"
  name="${base%.*}"

  # 검사 대상 확장자가 아니면 통과
  case " $CHECK_EXT " in
    *" $ext "*) : ;;
    *) return 0 ;;
  esac

  # routeTree.gen.ts 는 라우터 생성물 → 전체 검사 제외
  case "$base" in routeTree.gen.ts) return 0 ;; esac

  # TanStack Router 특수 파일이면 파일명 검사 예외 (경로 세그먼트는 아래에서 검사)
  local is_special=0
  case " $SPECIAL_FILES " in
    *" $name "*) is_special=1 ;;
  esac
  # src/routes/ 하위 파일은 라우터 문법($param, _layout, posts_, -excluded, dot-nesting)을 쓰므로 파일명 kebab 검사 제외
  case "/$path" in */routes/*) is_special=1 ;; esac

  # 1) 파일명 kebab 검사 (특수 파일 제외)
  if [ "$is_special" -eq 0 ]; then
    if ! _is_kebab_segment "$base"; then
      echo "파일명이 kebab-case가 아닙니다: '$base' (예: user-card.tsx)"
      violations=1
    fi
  fi

  # 2) 경로 중간 폴더 세그먼트 kebab 검사 (라우트 그룹 (group), 동적 $param, pathless _layout 등은 예외)
  local dir
  dir="$(dirname "$path")"
  IFS='/' read -ra segs <<< "$dir"
  for seg in "${segs[@]}"; do
    [ -z "$seg" ] || [ "$seg" = "." ] || [ "$seg" = ".." ] && continue
    # TanStack Router 특수 폴더 예외: (group), $param, _pathless/_private, -excluded(콜로케이션)
    case "$seg" in
      \(*\)|\$*|_*|-*|src|routes|node_modules) continue ;;
    esac
    if ! _is_kebab_segment "$seg"; then
      echo "폴더명이 kebab-case가 아닙니다: '$seg' (예: user-card)"
      violations=1
    fi
  done

  # 3) 동일명 1뎁스 중첩 경고: components/user-card/user-card.tsx 인데
  #    폴더에 동반 파일이 없으면 평탄화 권장
  local parent_dir_name
  parent_dir_name="$(basename "$dir")"
  if [ "$is_special" -eq 0 ] && [ "$parent_dir_name" = "$name" ] && [ -d "$dir" ]; then
    # 폴더 안에 자기 자신 외 다른 파일이 있는지 확인
    local sibling_count
    sibling_count="$(find "$dir" -maxdepth 1 -type f ! -name "$base" 2>/dev/null | wc -l | tr -d ' ')"
    if [ "$sibling_count" -eq 0 ]; then
      echo "동반 파일이 없는데 동일명 폴더로 감쌌습니다: '$parent_dir_name/$base' → 평탄화 권장(파일 하나면 폴더 없이)"
      violations=1
    fi
  fi

  return $violations
}
