---
name: state-management
description: 클라이언트/서버 상태 관리 도구 선택 기준. TanStack Query(서버) · nanostores(전역 클라) · Context · useState 중 무엇을 언제 쓸지 결정할 때 사용.
---

# 상태 관리 도구 선택

> 전역 클라이언트 스토어는 **nanostores로 통일**한다(Zustand/Jotai 대신). 서버 상태는 **TanStack Query**.

## 첫 질문: 서버 상태인가, 클라이언트 상태인가?

- **서버 상태**(API 데이터, 캐시·동기화·재요청 필요) → **TanStack Query** (`/react-query`)
  - 스토어에 복사해 넣지 말 것. 캐시·무효화를 Query에 맡긴다.
- **클라이언트 상태**(UI 상태, 토글, 선택, 필터 등) → 아래 결정 트리.

## 클라이언트 상태 결정 트리

```
상태 범위가 한 컴포넌트?                   → useState / useReducer
  ↓ 아니오 (몇몇 컴포넌트가 공유)
provider로 주입하는 저빈도 값(테마·로케일)?  → Context API
  ↓ 아니오 (자주 바뀌고 전역)
                                         → nanostores (atom / map / computed)
```

## nanostores 사용

- 스토어 변수는 **`$` 접두** 컨벤션. `atom`(단일 값) · `map`(객체) · `computed`(파생).
- 작고(≈300B) 프레임워크 무관이라 TanStack Start SSR에서도 안전하다.

```ts
// shared/stores/ui.ts
import { atom, map } from 'nanostores'
export const $sidebarOpen = atom(false)
export const $filters = map<{ q: string; page: number }>({ q: '', page: 1 })

// 컴포넌트
import { useStore } from '@nanostores/react'
const open = useStore($sidebarOpen)
$sidebarOpen.set(true)
```

## 기준 요약

| 도구 | 적합 | 주의 |
|------|------|------|
| `useState`/`useReducer` | 로컬 UI 상태 | prop drilling 심하면 상위/스토어로 |
| Context | provider 주입 저빈도 전역(테마·인증 유저·로케일) | **자주 바뀌는 값 금지**(구독 전체 리렌더) |
| **nanostores** | **전역 클라 상태 표준**(atom·map·computed) | 서버 데이터 중복 저장 금지 |
| TanStack Query | **모든 서버 상태** | 다른 스토어에 중복 저장 금지 |

## 안티패턴
- ❌ 서버 데이터를 nanostores/Context에 수동 복사 → 캐시·동기화는 Query 담당.
- ❌ 자주 바뀌는 값을 Context로 → 전체 하위 트리 리렌더.
- ❌ 로컬로 충분한 상태를 전역 스토어에.
- ❌ Zustand/Jotai 새로 도입 → 전역 스토어는 **nanostores로 통일**.
