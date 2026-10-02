---
name: shadcn-ui
description: >
  shadcn/ui + Tailwind v4 + cva + cn 기반 퍼블리싱 스킬.
  shadcn 컴포넌트 작업 시 항상 이 스킬을 먼저 읽고,
  토큰과 variant 구조를 확인한 뒤 작업하세요.
refs:
  - https://ui.shadcn.com/docs/theming (@theme inline 구조, 토큰 컨벤션, 다크모드)
  - https://cva.style/docs (cva variant 정의)
  - https://github.com/dcastil/tailwind-merge (tailwind-merge, cn 유틸)
---

# shadcn/ui 컴포넌트 퍼블리싱 규칙

## 전체 스택 흐름

```
:root / .dark          →  토큰 값 저장 (Base + Semantic)
@theme inline          →  Tailwind 유틸리티 클래스로 연결
cva                    →  variant props로 추상화
cn (clsx + twMerge)    →  클래스 충돌 해결
shadcn 컴포넌트        →  실제 사용
```

## 핵심 원칙

1. shadcn 컴포넌트 소스를 **직접 수정하지 않는다** — 토큰 값만 바꾼다
2. 새 토큰은 `:root`, `.dark`, `@theme inline` **세 곳 모두** 추가한다
3. 색상은 항상 `base + base-foreground` **쌍**으로 정의한다
4. variant 분기는 **cva**로, 클래스 충돌은 **cn**으로 처리한다

> shadcn 기본 토큰(`--background`/`--primary`/`--card`/`--border`/`--ring` 등 `base+foreground` 쌍), `globals.css` 골격, `cn` 유틸(`lib/utils.ts`)은 **shadcn CLI가 자동 생성**한다. 토큰 값 정의·다크모드 팔레트는 `design-tokens` 스킬 참조. 이 스킬은 그 위에서 **새 토큰 추가 + variant 설계**를 다룬다.

## 새 토큰 추가하는 법 (세 곳 동시)

예: `warning` 색상 추가

```css
/* 1. :root · .dark 에 값 정의 (base + foreground 쌍) */
:root { --warning: oklch(0.84 0.16 84); --warning-foreground: oklch(0.28 0.07 46); }
.dark { --warning: oklch(0.41 0.11 46); --warning-foreground: oklch(0.99 0.02 95); }

/* 2. @theme inline 에 Tailwind 브릿지 추가 */
@theme inline {
  --color-warning:            var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```

이후 `bg-warning text-warning-foreground` 로 바로 사용. **세 곳 중 하나라도 빠지면** 유틸리티 클래스가 안 만들어진다.

## cva로 variant 만들기

```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const button = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors", // base
  {
    variants: {
      variant: {
        primary:     "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:   "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:     "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost:       "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-12 px-6" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(button({ variant, size }), className)} {...props} />
}
```

## 색상 축이 여러 개면 — compoundVariants

단일 축으로는 색상이 늘수록 조합이 폭발한다. `variant`(스타일) × `color`(색상)로 분리하고 `compoundVariants`로 조합한다.

```tsx
cva("...", {
  variants: {
    variant: { default: "", outline: "border bg-transparent", ghost: "bg-transparent" },
    color:   { primary: "", destructive: "" },
  },
  compoundVariants: [
    { variant: "default", color: "primary",     class: "bg-primary text-primary-foreground" },
    { variant: "outline", color: "primary",     class: "border-primary text-primary hover:bg-primary/10" },
    { variant: "default", color: "destructive", class: "bg-destructive text-white" },
    { variant: "outline", color: "destructive", class: "border-destructive text-destructive hover:bg-destructive/10" },
  ],
  defaultVariants: { variant: "default", color: "primary" },
})
```

새 색상 추가 시: 토큰만 추가하고 `compoundVariants`에 (default/outline/ghost) 줄만 append.

## cn (클래스 충돌 해결)

`lib/utils.ts`의 `cn = twMerge(clsx(...))`(shadcn 설치 시 자동 생성). 컴포넌트는 항상 **외부 className을 마지막에 병합**해 사용자가 덮어쓸 수 있게 한다.

```tsx
cn("bg-primary", "bg-red-500")  // → "bg-red-500" (나중 값이 이김)
// 항상: className={cn(button({ variant, size }), className)}
```

## 다크모드 규칙

- 다크모드는 `.dark` 클래스로 제어(`<html class="dark">`).
- 컴포넌트 안에서 `dark:` prefix로 분기하지 않는다 — **토큰만 바꾼다**.

```
✅ .dark { --background: … }          ❌ className="bg-white dark:bg-gray-900"
```

## 드리프트 방지 체크리스트

- [ ] shadcn 컴포넌트 소스를 직접 수정하지 않았는가?
- [ ] 새 색상을 `:root`, `.dark`, `@theme inline` 세 곳 모두 추가했는가?
- [ ] `base + base-foreground` 쌍을 지켰는가?
- [ ] variant 분기를 cva로 처리했는가?
- [ ] 외부 className 충돌을 cn으로 처리했는가?
- [ ] 하드코딩 hex/rgb 없이 토큰만 사용했는가?
