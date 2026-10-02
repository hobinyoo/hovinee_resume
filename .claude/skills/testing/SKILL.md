---
name: testing
description: 테스트 전략 — Vitest(단위·컴포넌트) + Playwright(E2E). 테스트 작성·도구 선택·배치를 정할 때 사용.
---

# 테스트

## 도구
- **단위·컴포넌트**: **Vitest** (+ `@testing-library/react`, jsdom). Vite 네이티브라 설정 최소.
- **E2E**: **Playwright**.

## 배치 (콜로케이션)
- 단위/컴포넌트 테스트는 **대상 파일 옆**: `user-card.tsx` → `user-card.test.tsx`.
- E2E는 루트 `tests/`(또는 `e2e/`).

## 무엇을 테스트하나
- 순수 로직/유틸 → 입출력 단위 테스트.
- 컴포넌트 → 사용자 관점 상호작용(클릭·입력·표시). **구현 세부가 아니라 동작**을 검증.
- 서버 상태 훅 → `QueryClientProvider`로 감싸 렌더하고 `msw`로 네트워크 목.
- 핵심 플로우(로그인·CRUD) → Playwright E2E.

## 규칙
- 버그 수정 전, **버그를 재현하는 실패 테스트**를 먼저 작성한다(`systematic-debugging` 스킬).
- 테스트는 구현이 아니라 동작을 검증 → 리팩터링에 안 깨지게.
- **접근성 쿼리 우선**(`getByRole`/`getByLabelText`) → 접근성도 함께 검증(`web-accessibility` 스킬).

## 실행
- Vitest는 **`package.json`의 `test` 스크립트**로 실행한다. **bun은 `bun run test`** — 그냥 `bun test`는 bun 내장 러너라 Vitest가 안 돈다. (pnpm/yarn/npm은 `<pm> test`)
- E2E: `bunx playwright test`(또는 `pnpm exec playwright test` 등 감지된 일회성 실행기).
- `/code-quality` 커맨드가 변경분 관련 테스트/타입체크를 돌린다.
