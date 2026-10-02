---
name: react-query
description: TanStack Query(React Query) 패턴. 쿼리 키 팩토리, queryOptions, useQuery/useMutation, invalidate 규칙. features/*/queries, api 작업 시 사용.
---

# React Query (TanStack Query v5)

## 핵심 규칙

1. **기능별 query key factory 1개** — 키를 문자열로 흩뿌리지 않는다.
2. **`queryOptions` 헬퍼**로 쿼리 정의 — 타입 안전하게 재사용/무효화.
3. 쿼리 키는 **배열·계층형**: `entity → id → filters`.
4. 무효화는 **factory 키**로: `invalidateQueries({ queryKey: userKeys.lists() })`.

## 파일 배치

```
features/user/
├── queries/
│   ├── user-keys.ts        # query key factory
│   └── user-queries.ts     # queryOptions 모음
├── api/
│   └── user-api.ts         # fetch 함수
└── hooks/
    └── use-user.ts         # useQuery/useMutation 래핑
```

## 예시

```ts
// features/user/queries/user-keys.ts
export const userKeys = {
  all: ['user'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
}

// features/user/queries/user-queries.ts
import { queryOptions } from '@tanstack/react-query'
import { fetchUser } from '../api/user-api'
import { userKeys } from './user-keys'

export const userQueries = {
  detail: (id: string) =>
    queryOptions({ queryKey: userKeys.detail(id), queryFn: () => fetchUser(id) }),
}

// features/user/hooks/use-user.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userQueries } from '../queries/user-queries'
import { userKeys } from '../queries/user-keys'
import { updateUser } from '../api/user-api'

export function useUser(id: string) {
  return useQuery(userQueries.detail(id))
}

export function useUpdateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}
```

## 체크리스트
- [ ] 키는 factory에서만 생성 (하드코딩 배열 금지)
- [ ] 쿼리는 `queryOptions`로 정의
- [ ] 무효화 범위를 factory 키로 정확히 지정
- [ ] 뮤테이션 중 트리거 버튼 비활성화, 에러 처리 우선
