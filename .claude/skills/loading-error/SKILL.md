---
name: loading-error
description: TanStack Router + TanStack Query 기준 로딩/에러 UI 처리. 로딩·에러·빈 상태 UI를 작성하거나 라우트 pendingComponent/errorComponent, Suspense 중 무엇을 쓸지 정할 때 사용.
---

# 로딩 / 에러 처리

## 처리 순서 (항상 이 순서)
데이터를 다루는 UI는 **에러 → 로딩 → 빈 상태 → 성공** 순으로 분기한다.

```tsx
if (isError) return <ErrorState onRetry={refetch} />
if (isPending) return <Skeleton />
if (data.length === 0) return <EmptyState />
return <List items={data} />
```

## 어디서 처리할까 — 결정 기준

| 상황 | 방법 |
|------|------|
| 라우트 전체의 초기 로딩 | 라우트의 `pendingComponent` (라우트 loader 대기 fallback) |
| 라우트 전체의 렌더/로더 에러 | 라우트의 `errorComponent` (라우트 단위 Error Boundary) |
| 컴포넌트 단위 비동기 경계 | `<Suspense fallback>` + `useSuspenseQuery` |
| 목록/카드 등 부분 로딩 | 컴포넌트 안에서 `isPending` 분기 + Skeleton |
| 뮤테이션 진행 | 트리거 버튼 `disabled={isPending}` + 스피너 |

## 규칙
- **뮤테이션 중 트리거 버튼 비활성화** (중복 제출 방지).
- 로딩은 **스켈레톤/레이아웃 유지**를 우선(레이아웃 시프트 방지). 전체 스피너는 최소화.
- 에러는 **재시도 수단**(`refetch`)과 사람이 읽는 메시지를 함께 제공.
- 빈 상태를 로딩/에러와 구분해 명시적으로 처리(빈 배열을 에러처럼 다루지 않기).

## 안티패턴
- ❌ 성공 먼저 렌더 후 로딩 체크 → 순간 깜빡임/런타임 에러.
- ❌ `isLoading`만 보고 `isError` 무시 → 무한 스피너.
- ❌ 전역 하나의 로딩 스피너로 모든 부분 로딩 대체.
