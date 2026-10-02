---
name: auth
description: 인증·라우트 가드 패턴(TanStack Router beforeLoad). 로그인/보호 라우트/리다이렉트를 구현할 때 사용. 인증 라이브러리 비종속(mechanism 중심).
---

# 인증 · 라우트 가드

> 이 스킬은 **패턴(mechanism)** 만 다룬다. 실제 인증 제공자·토큰 발급 방식은 프로젝트별 → `AGENTS.md`의 "핵심 아키텍처 결정 — 인증"에 기록.

## 세션 상태
- 세션(로그인 유저)은 **서버 상태**다 → TanStack Query로 조회(`useQuery(sessionQueryOptions)`). 스토어에 수동 복사 금지. (`state-management` 스킬)
- 토큰은 **httpOnly + Secure + SameSite 쿠키** 권장(JS 접근 불가 → XSS 방어). 클라에서 토큰을 읽어 저장하지 않는다. (`security` 스킬)

## 보호 라우트 — `beforeLoad` 가드
로그인 필요한 라우트는 pathless 레이아웃(`_authed`)의 `beforeLoad`에서 세션을 확인하고 없으면 리다이렉트한다.

```tsx
// routes/_authed.tsx — 하위 라우트를 일괄 보호
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData(sessionQueryOptions)
    if (!session) {
      throw redirect({ to: '/login', search: { redirect: location.href } })
    }
    return { session } // 하위 라우트에서 context로 접근
  },
})
```

- `context.queryClient`는 라우터 생성 시 주입한다(router context).
- 로그인 성공 후 `search.redirect`로 원래 위치를 복원.
- **SPA 모드에서도** `beforeLoad`는 클라이언트에서 실행되어 가드가 동작한다. (`rendering-strategy` 스킬)

## 로그아웃
- 서버 세션 무효화(server function/API) → `queryClient.invalidateQueries`(세션 키) → 로그인으로 이동.

## 체크리스트
- [ ] 세션은 Query로(스토어 복사 금지), 토큰은 httpOnly 쿠키
- [ ] 보호 라우트는 `_authed` pathless 레이아웃의 `beforeLoad`로 일괄 가드
- [ ] 미인증 시 redirect + 원위치 복원(`search.redirect`)
- [ ] 401 응답 시 세션 무효화 + 로그인 이동 (`api-layer` 스킬)
