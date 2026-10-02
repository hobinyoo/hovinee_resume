#!/bin/bash
# git-host-detect.sh — git remote(+CLI/override)로 원격 호스트를 감지한다.
# GitHub → gh/PR, GitLab → glab/MR. 하드코딩 없이 "연결된 호스트"에 맞춘다.
# (pm-detect.sh가 락파일로 패키지 매니저를 감지하는 것과 같은 방식.)
#
# 사용:
#   detect_git_host [remote]   # "github" | "gitlab" | "unknown"
#   git_cli        [remote]    # "gh" | "glab" | ""      (감지된 호스트의 CLI)
#   git_pr_term    [remote]    # "PR" | "MR" | "PR/MR"   (사람이 부르는 이름)
#
# 감지 우선순위:
#   1) 환경변수 CLAUDE_GIT_HOST=github|gitlab (강제 지정, 최우선)
#   2) remote URL 매칭 (github.* / gitlab.*)
#   3) 설치된 CLI 폴백 (glab → gitlab, gh → github)  # 사내 커스텀 도메인 GitLab 대응

detect_git_host() {
  local remote="${1:-origin}" url

  # 1) 오버라이드 (감지가 틀리거나 커스텀 호스트일 때 강제 지정)
  case "$CLAUDE_GIT_HOST" in
    github|gitlab) echo "$CLAUDE_GIT_HOST"; return 0 ;;
  esac

  # 2) remote URL 매칭 (github 먼저 검사 → 그 다음 gitlab/커스텀 gitlab 도메인)
  url="$(git remote get-url "$remote" 2>/dev/null)"
  case "$url" in
    *github.com*|*@github.*|*://github.*) echo "github"; return 0 ;;
    *gitlab.com*|*@gitlab.*|*://gitlab.*|*gitlab*) echo "gitlab"; return 0 ;;
  esac

  # 3) 설치된 CLI로 폴백 (사내 커스텀 도메인 등 URL로 못 잡는 경우)
  if command -v glab >/dev/null 2>&1; then echo "gitlab"; return 0; fi
  if command -v gh   >/dev/null 2>&1; then echo "github"; return 0; fi

  echo "unknown"
}

git_cli() {
  case "$(detect_git_host "${1:-origin}")" in
    github) echo "gh" ;;
    gitlab) echo "glab" ;;
    *)      echo "" ;;
  esac
}

git_pr_term() {
  case "$(detect_git_host "${1:-origin}")" in
    github) echo "PR" ;;
    gitlab) echo "MR" ;;
    *)      echo "PR/MR" ;;
  esac
}
