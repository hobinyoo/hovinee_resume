# skills/

도메인별 코딩 지침. 프롬프트에 따라 `skill-eval` 훅이 자동 추천하거나 `/스킬명`으로 직접 호출한다.

## 현재 스킬
- `project-conventions` — 팀 네이밍·폴더구조·파일구조·커밋/브랜치 규칙
- `component-design` — shadcn + cva + cn 컴포넌트 설계
- `shadcn-ui` — shadcn/ui + Tailwind v4 토큰·variant 퍼블리싱
- `react-query` — TanStack Query 패턴(키 팩토리·queryOptions)
- `api-layer` — features/*/api fetch 레이어(base 클라이언트·에러 정규화·401)
- `auth` — 인증·라우트 가드(TanStack Router beforeLoad)
- `loading-error` — 로딩/에러/빈 상태 UI 처리 순서
- `rendering-strategy` — TanStack Start SPA 모드 · selective SSR 렌더링 전략
- `security` — XSS/CSRF/토큰 저장/env 노출 방지
- `state-management` — 서버(Query)/전역 클라(nanostores) 상태 선택 기준
- `systematic-debugging` — 근본 원인 4단계 디버깅 방법론
- `testing` — Vitest(단위·컴포넌트) + Playwright(E2E)
- `web-accessibility` — KWCAG 2.2 컴포넌트 접근성
- `tanstack-form` — TanStack Form + Zod 폼 패턴
- `design-tokens` — Tailwind v4 디자인 토큰

## 스킬 추가 방법

```
skills/<이름>/SKILL.md
```

`SKILL.md` 프론트매터:
```yaml
---
name: <이름>
description: 무엇을 하는지, 언제 트리거되는지.
---
```

## ⭐ 이름 3중 일치 규칙 (필수)

자동 추천이 깨지지 않으려면 세 곳의 이름이 **정확히 동일**해야 한다:

1. 폴더명: `skills/<이름>/`
2. frontmatter `name: <이름>`
3. `hooks/skill-rules.json` 의 `skills.<이름>` 키 (및 directoryMappings 값)

> 스킬을 추가하면 반드시 `skill-rules.json`에 트리거 규칙도 추가한다.
> 정합성 점검: 저장소 검증 스크립트 또는 아래 한 줄로 폴더명 == rules 키를 확인.
>
> ```bash
> diff <(ls -d skills/*/ | xargs -n1 basename | sort) \
>      <(node -e "console.log(Object.keys(require('./hooks/skill-rules.json').skills).join('\n'))" | sort)
> ```
