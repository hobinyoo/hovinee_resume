# 프로젝트 지침 (Claude 필독)

이 프로젝트는 **팀 공통 컨벤션**을 따른다. 모든 규칙의 단일 진실원은 저장소 루트의 **`CONVENTIONS.md`** 이다.
아래는 작업 중 항상 지켜야 할 요약이며, 상세·근거는 `CONVENTIONS.md`를 본다.

## 반드시 지킬 것 (요약)

### 네이밍
- 파일명·폴더명은 **kebab-case** (`user-card.tsx`, `use-auth.ts`).
  - 예외: TanStack Router 특수 파일·세그먼트(정식 목록은 `CONVENTIONS.md §1`, 주로 `src/routes/`).
- 컴포넌트 식별자는 **PascalCase**, 훅은 `useXxx`(파일 `use-xxx.ts`), 타입은 PascalCase, 상수는 UPPER_SNAKE_CASE.

### 구조 (기능 기반 + 콜로케이션)
- `src/routes/`는 **라우팅 전용**(TanStack Router 파일 라우팅). 비즈니스 로직은 `src/features/<도메인>/`에 콜로케이트.
- 여러 기능이 공유하면 `src/shared/`. 거대한 단일 `components/` 폴더 금지.

### 컴포넌트 파일
- **평탄 기본**: 파일 하나면 `components/user-card.tsx`.
- 동반 파일(테스트·서브컴포넌트·전용 훅)이 생기면 **폴더로 승격**, 메인 파일명=폴더명.
- **index 배럴 금지**(내부 컴포넌트) — 실제 파일을 직접 import.

### 서버 상태 (TanStack Query)
- 기능별 **query key factory 1개** + `queryOptions` 헬퍼. 키는 계층형 배열, 무효화도 factory 키로.

### TypeScript
- `strict`. **`any` 금지**(불가피하면 `unknown`+좁히기). 얼리 리턴으로 중첩 최소화.

### UI 상태
- **에러 → 로딩 → 빈 상태 → 성공** 순서. 뮤테이션 중 트리거 버튼 비활성화.

### 커밋 / 브랜치
- 커밋: `<type>: 제목`(한국어). 타입 고정 세트: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`.
- 브랜치: `feat/설명` 또는 `feat/PROJ-123-설명` (설명은 kebab-case). `main`에서 직접 편집 금지.

## 자동화 (참고)
- 프롬프트 입력 시 관련 스킬이 자동 추천된다(`/스킬명`으로 직접 호출도 가능).
- 파일 저장 시 포맷터가 자동 실행되고, 파일명/경로 컨벤션이 자동 점검된다(기본 경고).
- 상세는 `.claude/README.md`.
