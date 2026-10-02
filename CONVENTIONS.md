# 팀 프론트엔드 컨벤션 (단일 진실원)

이 문서는 **사람과 Claude 모두가 지키는 팀 공통 규칙의 단일 진실원(Single Source of Truth)** 이다.
`.claude/CLAUDE.md`는 이 문서를 요약·링크하고, `.claude/hooks/`의 자동 검사는 일부 규칙을 기계적으로 검증한다.

> 규칙을 바꾸려면 **이 문서를 먼저 고치고**, 필요하면 `hooks/lib/naming-check.sh`와 `hooks/skill-rules.json`의 파라미터를 맞춘다.

대상 스택: **TanStack Start (SPA 모드 기본 · selective SSR) + TanStack Router + TanStack Query + TanStack Form + nanostores + TypeScript + shadcn/ui + Tailwind v4**. 린트·포맷 Biome, 테스트 Vitest + Playwright.

---

## 1. 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 파일명 | **kebab-case** | `user-card.tsx`, `use-auth.ts` |
| 폴더명 | **kebab-case** | `components/user-card/` |
| React 컴포넌트 식별자 | **PascalCase** | `function UserCard() {}` |
| 훅 | `useXxx` / 파일은 `use-xxx.ts` | `useAuth` → `use-auth.ts` |
| 타입 · 인터페이스 | **PascalCase** | `type UserProfile`, `interface AuthState` |
| 상수 | **UPPER_SNAKE_CASE** | `const MAX_RETRY = 3` |
| 불리언 | `is/has/should` 접두 | `isLoading`, `hasError` |

### 파일명 예외 (kebab-case 강제에서 제외)
TanStack Router 파일 기반 라우팅이 이름/문법을 예약한 특수 파일·세그먼트는 그대로 둔다(주로 `src/routes/` 하위):

```
__root.tsx   route.tsx   index.tsx          # 루트 / 레이아웃 / 인덱스
$postId.tsx  $.tsx                          # 동적 세그먼트 / splat
_layout.tsx  posts_.tsx                     # pathless 레이아웃(_접두) / non-nested(_접미)
(group)/     -components/                    # 라우트 그룹 / 라우팅 제외(콜로케이션)
routeTree.gen.ts                            # 생성물 (수정 금지)
```

> **핵심**: 앱 코드 파일명은 kebab, **컴포넌트 식별자는 PascalCase**. (`user-card.tsx` 안의 `export function UserCard`)
> 이는 Vite/TanStack·Tailwind·shadcn이 수렴한 현재 표준이며, shadcn CLI가 OS 대소문자 이슈를 피하려 lowercase를 쓰는 이유와 같다. `src/routes/`는 위 라우터 문법을 따르므로 kebab 예외다.

---

## 2. 디렉토리 구조 — 기능(도메인) 기반 + 콜로케이션

`routes/`는 **라우팅 전용**(TanStack Router 파일 라우팅), 비즈니스 로직은 `features/`로. 거대한 단일 `components/` 폴더는 금지한다(파일이 200개를 넘으면 아무도 못 찾는다).

```
src/
├── routes/                   # 라우팅 전용. __root/route/index/$param 등 라우터 파일만.
│   ├── __root.tsx            # 루트 라우트(공통 셸)
│   └── (group)/…             # 라우트 그룹: URL 영향 없이 레이아웃 공유
├── router.tsx                # 라우터 인스턴스 (routeTree.gen.ts 는 생성물)
├── features/                 # 도메인별 모듈 (기능 단위 콜로케이션)
│   └── auth/
│       ├── components/       # 이 기능 전용 컴포넌트 (평탄 기본)
│       ├── hooks/            # use-*.ts
│       ├── api/              # fetch / 서버 함수(createServerFn)
│       ├── queries/          # query key factory + queryOptions
│       ├── store/            # 필요 시 nanostores 등 클라 상태
│       └── types.ts
├── shared/                   # 여러 기능이 공유하는 재사용 코드
│   ├── ui/                   # shadcn 원자 컴포넌트 (kebab)
│   ├── components/           # 공용 조합 컴포넌트
│   ├── hooks/                # 공용 훅
│   └── lib/                  # 공용 유틸
├── lib/                      # 저수준 유틸 / 얇은 서버 데이터 접근
├── styles/                   # 토큰 / 글로벌 CSS
└── types/                    # 전역 타입
tests/                        # E2E 등 (단위 테스트는 대상 파일 옆에 콜로케이트)
```

- **콜로케이션이 핵심 습관**: 라우트/기능이 쓰는 것(컴포넌트·테스트·스타일)은 그 옆에 둔다.
- **작은 프로젝트**는 타입 기반(`src/components`, `src/hooks`)으로 시작해도 되고, 커지면 `features/`로 분리한다.
- `features`·`shared` 등 폴더 명칭은 `hooks/lib/naming-check.sh` 상단 변수로 프로젝트마다 조정 가능.

---

## 3. 컴포넌트 파일 구조 — 평탄 기본, 동반파일 시 폴더 승격

- **기본은 평탄**: 파일 하나면 폴더 없이 `components/user-card.tsx`.
  - 불필요한 뎁스, `user-card/user-card.tsx` 이름 중복, `index` 탭 범람을 막는다.
- **동반 파일이 생기면 폴더로 승격**: 테스트·서브컴포넌트·전용 훅·스타일이 붙을 때만 폴더로 올린다.
  - 이때 **메인 파일명은 폴더명을 유지**한다.
  ```
  components/
    user-card.tsx                 # 단일 → 평탄
    data-table/                   # 동반 파일 생김 → 승격
      data-table.tsx              # 메인 = 폴더명
      data-table.test.tsx
      columns.tsx
  ```
- **index 배럴 금지 (내부 컴포넌트)**: 실제 파일을 직접 import 한다.
  ```ts
  import { UserCard } from '@/components/user-card'
  import { DataTable } from '@/components/data-table/data-table'
  ```
  - 이유: 배럴은 트리셰이킹을 막아 번들·빌드를 키운다(제거 시 first-load JS 1.5MB→200KB, dev 빌드 15~70%↑ 보고). re-export 20개를 넘으면 병목.
  - 배럴은 필요할 때 **feature의 public 경계**에서만 예외적으로 둔다.

### import 순서
1. 외부 패키지 (`react`, `@tanstack/*`, …)
2. 내부 alias (`@/…`)
3. 상대 경로 (`./`, `../`)

> Biome `organizeImports`가 이 순서(그룹 사이 빈 줄 포함)를 자동 정리·강제한다 — `biome.jsonc`.

---

## 4. 서버 상태 (TanStack Query)

- **기능별 query key factory 1개** + `queryOptions` 헬퍼를 둔다.
- 쿼리 키는 **배열·계층형**: `entity → id → filters`. 무효화도 factory 키로 한다.

```ts
export const userKeys = {
  all: ['user'] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
}
queryClient.invalidateQueries({ queryKey: userKeys.all })  // 범위 무효화
```

> 파일 배치(`queries/*-keys.ts` · `*-queries.ts`)와 `queryOptions`/`useQuery`/`useMutation` 전체 예시는 `react-query` 스킬 참조.

---

## 5. 커밋 · 브랜치 · PR

### 커밋
- 형식: `<type>: 제목` (한국어), 제목 ≤ 50자. 본문은 **무엇/왜**(어떻게 아님), `-`로 구분.
- **타입은 표준 세트로 고정** (Conventional Commits + Angular/commitlint 표준, 팀 내 변경 없음). 이 세트가 개인/전역 설정(`~/.claude/CLAUDE.md` 등)보다 **우선**하며, `hooks/git/commit-msg` 훅이 강제한다:

  `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`

| 타입 | 용도 |
|------|------|
| `feat` | 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 |
| `style` | 포맷·세미콜론 등 동작 없는 변경 |
| `refactor` | 리팩터링 |
| `perf` | 성능 개선 |
| `test` | 테스트 |
| `build` | 빌드 시스템·의존성 |
| `ci` | CI 설정 |
| `chore` | 잡무 |
| `revert` | 되돌리기 |

### 브랜치
- **커밋과 동일 어휘인 `feat/` 축약형으로 통일** + 티켓 선택적.
  - 티켓 있으면: `feat/PROJ-123-login-button`
  - 티켓 없으면: `feat/login-button`
- 설명은 kebab-case. (`feature/`(Git Flow) 대신 커밋 타입과 어휘를 맞춘다.)

### PR / MR
- 원격 호스트에 맞춘다: **GitHub → PR(`gh`), GitLab → MR(`glab`)**. 호스트는 `git remote`로 자동 감지한다(`.claude/hooks/lib/git-host-detect.sh`). 감지가 애매하면 `CLAUDE_GIT_HOST=github|gitlab`로 지정.
- 제목·본문은 한국어. 본문은 무엇/왜 + 확인 방법.
- `includeCoAuthoredBy`(AI 공동작성자 표기)는 **팀 정책 토글** — `.claude/README.md`의 안내대로 켜고 끈다.

---

## 6. TypeScript

- `strict` 모드. **`any` 금지**(불가피하면 `unknown` + 좁히기).
- 얼리 리턴으로 중첩 최소화.
- 컴포넌트 props는 `interface` 또는 `type`으로 명시.

---

## 7. UI 상태 처리 순서

데이터 UI는 **에러 → 로딩 → 빈 상태 → 성공** 순으로 처리한다.
뮤테이션 진행 중에는 트리거 버튼을 비활성화한다.

> 상세(라우트 `pendingComponent`/`errorComponent` vs `Suspense`+`useSuspenseQuery` 선택)는 `loading-error` 스킬 참조.

---

## 8. 렌더링 · 테스트

- **렌더링**: TanStack Start **SPA 모드 기본**(`vite.config`의 `tanstackStart({ spa: { enabled: true } })` → 정적 셸 + 클라 렌더). SSR이 필요하면 SPA 대신 selective SSR로 전환. 시크릿·서버 전용은 `createServerFn`. 상세는 `rendering-strategy` 스킬.
- **테스트**: 단위·컴포넌트 **Vitest**(대상 파일 옆 `*.test.tsx` 콜로케이션), E2E **Playwright**(`tests/`). 구현이 아니라 **동작**을 검증. 상세는 `testing` 스킬.
