---
description: 지정 디렉토리(또는 변경분)의 코드 품질을 점검한다 — 타입체크, lint, 컨벤션.
argument-hint: "[디렉토리 경로 (생략 시 변경분)]"
---

대상: `$ARGUMENTS` (비었으면 `git diff --name-only`의 변경 파일).

다음을 순서대로 수행하고 결과를 요약해줘:

1. **패키지 매니저 감지**: 락파일로 pnpm/yarn/bun/npm 판별 (`.claude/hooks/lib/pm-detect.sh` 참고).
2. **타입체크**: 감지된 PM으로 `tsc --noEmit` 실행 (예: bun이면 `bun x tsc --noEmit`, pnpm이면 `pnpm exec tsc --noEmit`). 첫 에러들부터 보고.
3. **Lint**: **Biome** 표준 — `<pm> exec biome check`(또는 프로젝트 lint 스크립트 `<pm> run lint`).
4. **컨벤션 점검**: 대상 파일들이 `CONVENTIONS.md`를 지키는지 확인
   - 파일명/폴더명 kebab-case (TanStack Router 특수 파일 예외)
   - 컴포넌트 배럴 index.ts 남용 여부
   - `routes/`에 비즈니스 로직이 섞였는지
   - `any` 사용 여부
5. 발견 사항을 **심각도 순**으로 정리하고, 각 항목에 파일:라인과 수정 제안을 붙인다.

> 전체 프로젝트 `tsc`는 무겁다. 변경분 위주로 빠르게 점검하고, 필요 시 전체 실행을 제안한다.
