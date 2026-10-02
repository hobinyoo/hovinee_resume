---
description: 팀 표준(CONVENTIONS.md)을 기반으로 PR/MR을 리뷰한다. 원격 호스트에 맞춰 gh(PR)/glab(MR) 사용.
allowed-tools: Read, Glob, Grep, Bash(git:*), Bash(gh:*), Bash(glab:*)
---

# PR / MR 리뷰

리뷰 대상: $ARGUMENTS (PR/MR 번호 또는 URL)

## 지침

0. **원격 호스트 감지**: `.claude/hooks/lib/git-host-detect.sh`를 소싱해 `git_cli`/`git_pr_term`으로 CLI와 용어를 정한다.
   - GitHub → `gh` (PR), GitLab → `glab` (MR). 감지가 `unknown`이면 사용자에게 확인(또는 `CLAUDE_GIT_HOST=github|gitlab`로 지정).

1. **정보 가져오기** (감지된 CLI로):
   - GitHub: `gh pr view $ARGUMENTS` / `gh pr diff $ARGUMENTS`
   - GitLab: `glab mr view $ARGUMENTS` / `glab mr diff $ARGUMENTS`

2. **리뷰 기준 읽기**:
   - 팀 컨벤션 단일 진실원 `CONVENTIONS.md`
   - 리뷰 체크리스트는 `.claude/agents/code-reviewer.md`

3. **변경된 모든 파일에 체크리스트 적용**:
   - 컨벤션(kebab 파일명·기능 기반 구조·`src/routes/`는 라우팅 전용), TypeScript strict(`any` 금지)
   - 서버 상태(query key factory + `queryOptions`, 무효화 범위), UI 상태 순서(에러→로딩→빈 상태→성공)
   - 보안(XSS·토큰 저장·`VITE_` 시크릿 노출), 웹 접근성
   - 테스트 커버리지, 문서 업데이트

4. **구조화된 피드백 제공** (심각도 순, 각 항목에 파일:라인 + 근거 + 수정 제안):
   - **Critical**: 머지 전 반드시 수정
   - **Warning**: 수정 권장
   - **Suggestion**: 있으면 좋은 것

5. **댓글 작성** (사용자가 요청하면): GitHub `gh pr comment`, GitLab `glab mr note`.
