---
name: tanstack-form
description: TanStack Form + Zod 유효성 검증 패턴. 폼 작성, 유효성 검증 추가, 필드 에러 표시 시 사용.
---

# TanStack Form + Zod

## 원칙
- 스키마는 **Zod로 단일 정의**하고, 폼 검증과 타입을 여기서 파생한다.
- 검증은 `onChange`/`onBlur`/`onSubmit` 레벨을 상황에 맞게. 제출 시 최종 검증은 필수.
- 필드 에러는 접근성 있게 표시(`aria-invalid` + `aria-describedby`, `/web-accessibility` 참고).
- 제출 중 버튼 비활성화(`isSubmitting`).

## 골격

```tsx
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('올바른 이메일을 입력하세요'),
  password: z.string().min(8, '8자 이상'),
})
type FormValues = z.infer<typeof schema>

export function LoginForm() {
  const form = useForm({
    defaultValues: { email: '', password: '' } as FormValues,
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => { await login(value) },
  })

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
      <form.Field name="email">
        {(field) => (
          <div>
            <label htmlFor={field.name}>이메일</label>
            <input
              id={field.name}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={field.state.meta.errors.length > 0}
              aria-describedby={`${field.name}-error`}
            />
            {field.state.meta.errors.length > 0 && (
              <p id={`${field.name}-error`} role="alert">
                {field.state.meta.errors.join(', ')}
              </p>
            )}
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <button type="submit" disabled={isSubmitting}>로그인</button>
        )}
      </form.Subscribe>
    </form>
  )
}
```

## 체크리스트
- [ ] Zod 스키마 단일 정의, 타입 파생(`z.infer`)
- [ ] 필드 에러 aria 연결
- [ ] 제출 중 버튼 비활성화
- [ ] 서버 검증 에러도 필드에 매핑
