---
name: api-layer
description: features/*/api 의 fetch 레이어 규약 — base 클라이언트, 에러 정규화, 401 처리, 타입 응답. API 호출 함수를 작성할 때 사용.
---

# API 레이어 (features/*/api)

TanStack Query의 `queryFn`/`mutationFn`이 호출하는 **fetch 함수**를 여기 둔다. Query는 캐싱, 이 레이어는 **네트워크·에러 정규화**를 담당한다.

## base 클라이언트
- **base URL**은 `VITE_API_URL`(클라 노출) 또는 서버 함수에서. 하드코딩 금지. (`security` 스킬)
- 공통 헤더·크리덴셜(`credentials: 'include'` — httpOnly 쿠키 전송)을 한 곳에서.
- 응답은 **타입**을 제네릭으로 명시. `any` 금지.

```ts
// shared/lib/api-client.ts
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) throw await toApiError(res) // 에러 정규화
  return res.status === 204 ? (undefined as T) : res.json()
}
```

## 에러 정규화
- 모든 실패를 **일관된 에러 타입**으로 변환(`toApiError`: `status`·`code`·`message`) → 컴포넌트·Query가 동일하게 처리.
- **401**: 세션 무효화 + 로그인 이동(`auth` 스킬). fetch 래퍼나 QueryClient 전역 핸들러 **한 곳**에서 처리.

## features 배치
```
features/user/api/user-api.ts   # fetchUser, updateUser … apiFetch 사용
```
- `queryFn`에서 이 함수를 부른다(`react-query` 스킬). **컴포넌트가 직접 fetch 금지**.

## 체크리스트
- [ ] base URL·헤더·크리덴셜은 공통 클라이언트에서(하드코딩·중복 금지)
- [ ] 응답 타입 명시, `any` 없음
- [ ] 에러를 정규화된 타입으로, **401은 전역 처리**
- [ ] 컴포넌트는 api 함수만 호출(직접 fetch 금지)
