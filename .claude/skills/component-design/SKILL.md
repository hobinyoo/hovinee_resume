---
name: component-design
description: shadcn/ui + cva + cn 기반 컴포넌트 설계 원칙. 새 컴포넌트/모달/폼/버튼을 만들거나 리팩터링할 때 사용.
---

# 컴포넌트 설계

대상 스택: **shadcn/ui + Tailwind v4 + cva + cn**.

## 원칙

1. **위치**: 기능 전용은 `features/<도메인>/components/`, 공용 원자는 `shared/ui/`, 공용 조합은 `shared/components/`.
2. **파일**: kebab-case, 평탄 기본. 컴포넌트 식별자는 PascalCase.
3. **variant는 cva로**: 조건부 클래스 분기를 JSX에 흩뿌리지 말고 `cva`로 정의.
4. **className 병합은 cn**: `cn(base, className)` 으로 외부 오버라이드를 허용.
5. **props**: `interface`로 명시, `VariantProps<typeof xxxVariants>` 활용.

## 골격 예시

```tsx
// shared/ui/badge.tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        outline: 'border border-input text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
```

## 체크리스트
- [ ] 파일명 kebab, 컴포넌트 PascalCase
- [ ] 분기 스타일은 cva로, 병합은 cn으로
- [ ] props 타입 명시, `any` 없음
- [ ] 접근성: 인터랙티브 요소에 role/aria/키보드 대응
- [ ] 파일 하나면 폴더로 감싸지 않음(평탄)
