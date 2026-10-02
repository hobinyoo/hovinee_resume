---
name: project-conventions
description: 팀 프론트엔드 컨벤션(네이밍·폴더구조·파일구조·커밋/브랜치). 새 파일/폴더/컴포넌트를 만들거나 "어디에 둬야 해?"를 판단할 때 사용. 단일 진실원은 루트 CONVENTIONS.md.
---

# 프로젝트 컨벤션

> 상세·근거는 루트 `CONVENTIONS.md`. 이 스킬은 작업 시 빠르게 참조할 결정 규칙이다.

## 새 파일을 만들 때 결정 순서

1. **어느 계층인가?**
   - 특정 기능 전용 → `src/features/<도메인>/…`
   - 여러 기능 공유 → `src/shared/…`
   - 라우팅 → `src/routes/…` (TanStack Router: `__root`/`route`/`index`/`$param`만, 로직 넣지 말 것)
2. **파일명은 kebab-case** (`user-card.tsx`). 컴포넌트 식별자는 PascalCase(`UserCard`).
3. **폴더로 감쌀까?** → 파일 하나면 **감싸지 말고 평탄**. 동반 파일이 생기면 그때 폴더로 승격.

## 네이밍 (핵심만 — 전체 표는 `CONVENTIONS.md §1`)

- 파일/폴더 **kebab-case**, 컴포넌트 식별자 **PascalCase**, 훅 `useXxx`(`use-xxx.ts`), 타입 PascalCase, 상수 UPPER_SNAKE_CASE.
- 예외(파일명 그대로): TanStack Router 특수 파일(정식 목록은 `CONVENTIONS.md §1`, 주로 `src/routes/`).

## 컴포넌트 파일 구조 (전체 예시는 `CONVENTIONS.md §3`)

- **평탄 기본**: 파일 하나면 `components/user-card.tsx`.
- **동반 파일 생기면 폴더 승격**: 메인 파일명 = 폴더명, **index 배럴 금지** → 실제 파일 직접 import.

## 커밋 / 브랜치
- 커밋 타입(고정): `feat fix docs style refactor perf test build ci chore revert`. 형식 `<type>: 제목`.
- 브랜치: `feat/설명` 또는 `feat/PROJ-123-설명`. `main` 직접 편집 금지.

## 안티패턴 (하지 말 것)
- ❌ PascalCase 파일명(`UserCard.tsx`) — kebab으로.
- ❌ 파일 하나인데 `user-card/user-card.tsx`로 감싸기 — 평탄화.
- ❌ 컴포넌트 배럴 `index.ts` 남발 — 직접 import.
- ❌ `src/routes/`에 비즈니스 로직 — `features/`로.
- ❌ 거대한 단일 `components/` — 기능별 분리.
