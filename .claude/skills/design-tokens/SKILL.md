---
name: design-tokens
description: Tailwind v4 디자인 토큰 퍼블리싱 규칙. 색상·간격·타이포·radius 토큰을 정의/수정하거나 styles/ 작업 시 사용.
---

# 디자인 토큰 (Tailwind v4)

Tailwind v4는 **CSS 우선(`@theme`)** 로 토큰을 정의한다. `tailwind.config.js`의 JS 테마 확장 대신 CSS에서 관리한다.

## 정의 위치
`src/styles/globals.css` (또는 `tokens.css`):

```css
@import "tailwindcss";

@theme {
  /* 색상: --color-<이름> → bg-<이름>, text-<이름> 유틸 생성 */
  --color-primary: oklch(0.62 0.19 260);
  --color-primary-foreground: oklch(0.98 0 0);
  --color-muted: oklch(0.96 0 0);

  /* 간격·radius·타이포 */
  --radius-card: 0.75rem;
  --font-sans: "Pretendard", ui-sans-serif, system-ui;
}
```

## 규칙
- **원시 값(hex/px)을 컴포넌트에 직접 쓰지 않는다** → 반드시 토큰 유틸(`bg-primary`, `rounded-card`).
- 색상은 **의미 기반 이름**(`primary`, `destructive`, `muted`)으로. `blue-500` 같은 원시색을 컴포넌트에서 직접 참조 금지.
- 다크 모드는 `@theme` + `:root`/`.dark` 커스텀 프로퍼티 오버라이드로.
- shadcn 토큰(`--background`, `--foreground`, `--border` 등) 네이밍과 정합성 유지(`/shadcn-ui`, `/component-design` 참고).

## 안티패턴
- ❌ 컴포넌트에 `style={{ color: '#3b82f6' }}` 또는 `text-[#3b82f6]`.
- ❌ 같은 색을 여러 이름으로 중복 정의.
- ❌ 토큰 없이 매직 넘버 간격(`mt-[13px]`).

## 체크리스트
- [ ] 새 색/간격은 `@theme` 토큰으로 추가 후 유틸로 사용
- [ ] 의미 기반 네이밍
- [ ] 다크 모드 대응
- [ ] shadcn 토큰과 이름 충돌·중복 없음
