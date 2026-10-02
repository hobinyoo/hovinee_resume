---
name: rendering-strategy
description: TanStack Start 렌더링 전략(SPA 모드 기본). 새 라우트/페이지를 만들거나 데이터 로딩·SSR 여부를 정할 때 사용.
refs:
  - https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode
  - https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr
---

# 렌더링 전략 (TanStack Start · SPA 모드 기본)

## 기본: SPA 모드
- 이 프로젝트는 **SPA 모드**로 구성한다. 번들러(`vite.config`)의 `tanstackStart` 플러그인 옵션으로 켠다:
  ```ts
  // vite.config.ts
  tanstackStart({ spa: { enabled: true } })
  ```
- 서버는 **정적 셸만** 내보내고 라우팅·렌더는 **클라이언트**에서 → CDN 배포, hydration 이슈 없음, 단순.
- 관리자 사이트는 로그인 뒤 내부용이라 SSR/SEO가 대부분 불필요 → SPA가 기본.
- ⚠️ **SPA 모드 ≠ `defaultSsr: false`**. `createStart({ defaultSsr: false })`는 SSR 앱에서 라우트별 SSR 기본값만 끄는 것(서버는 여전히 렌더). 진짜 정적 셸/CDN을 원하면 위 `spa.enabled`가 필요하다.

## 데이터 로딩 (SPA에서도 동일)
- 라우트 데이터 = **route loader + TanStack Query**. loader에서 `queryClient.ensureQueryData(...)`로 프리페치하고 컴포넌트는 `useQuery`로 읽는다. (`react-query` 스킬)
- 서버 전용 로직·시크릿 = **`createServerFn`** — SPA 모드에서도 서버 함수는 그대로 동작한다(별도 RPC 엔드포인트).

## SSR이 꼭 필요하면 (예외 — SPA 대신 SSR 앱)
일부 공개 라우트(로그인·랜딩)에 초기 페인트/SEO가 중요하면 SPA 모드 대신 **SSR + selective SSR**로 운영한다:
- `createStart({ defaultSsr: false })`로 라우트 기본 SSR을 끄고, 필요한 라우트만 `ssr: true`(데이터만이면 `ssr: 'data-only'`)로 opt-in.
- 이는 `spa.enabled`와 **다른 구성**이다. 프로젝트 초기에 둘 중 하나를 택한다.

## 결정
```
관리자 내부 화면 위주, SSR/SEO 불필요?   → SPA 모드 (spa.enabled: true)     ← 기본
공개 페이지 초기 페인트/SEO가 중요?       → SSR 앱 + selective SSR (ssr: true 라우트만)
```

## 주의
- SPA/SSR 무엇이든 시크릿은 `createServerFn`으로 **서버에만** 둔다(→ `security` 스킬).
- 서버 상태 = TanStack Query, 전역 클라 상태 = nanostores (→ `state-management` 스킬).
- 로딩/에러 UI는 라우트 `pendingComponent`/`errorComponent` 또는 Suspense (→ `loading-error` 스킬).
