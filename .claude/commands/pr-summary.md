---
description: 현재 브랜치 변경 사항으로 PR/MR 요약(한국어)을 생성한다.
---

현재 브랜치와 `main`(또는 기본 브랜치)의 차이를 분석해 PR/MR 요약을 **한국어**로 작성해줘.

0. **원격 호스트 감지**: `.claude/hooks/lib/git-host-detect.sh`를 소싱해 `git_pr_term`/`git_cli`로 호스트를 판별한다(GitHub→`gh`/PR, GitLab→`glab`/MR). 아래 "PR"은 GitLab이면 "MR"로 읽는다.
1. `git log main..HEAD --oneline` 과 `git diff main...HEAD --stat` 으로 변경 범위 파악.
2. 아래 형식으로 초안 작성:

```
## 무엇을 (What)
- 핵심 변경 사항 불릿

## 왜 (Why)
- 배경/문제와 이 변경이 해결하는 것

## 확인 방법 (How to test)
- 재현/검증 절차

## 참고
- 관련 티켓: (있으면 PROJ-123 등)
```

3. 제목은 커밋 컨벤션과 동일하게 `<type>: 제목` 형식(한국어)으로 제안.
4. `includeCoAuthoredBy`/AI 공동작성자 표기는 팀 정책을 따르며, 본문에 임의로 넣지 않는다.
5. 사용자가 **생성까지** 요청하면 감지된 CLI로: GitHub는 `gh pr create`, GitLab은 `glab mr create`. 감지가 `unknown`이면 어느 호스트인지 사용자에게 확인한다(또는 `CLAUDE_GIT_HOST`로 지정 가능).

브랜치 비교 대상이 불명확하면 사용자에게 기본 브랜치를 물어본다.
