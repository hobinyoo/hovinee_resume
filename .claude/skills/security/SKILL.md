---
name: security
description: 프론트엔드 보안 코딩 규칙. XSS, CSRF, 인증 토큰 저장, 환경변수 노출 방지. 인증/입력 처리/외부 데이터 렌더링 코드를 작성할 때 사용.
---

# 프론트엔드 보안

## XSS (교차 사이트 스크립팅)
- **`dangerouslySetInnerHTML` 지양**. 불가피하면 `DOMPurify`로 sanitize 후 주입.
- 사용자/외부 입력을 `href`, `src`, `style`, `eval`, `new Function` 에 직접 넣지 않는다.
- `javascript:` URL 차단, 링크는 스킴 화이트리스트(http/https/mailto)만.

## 인증 토큰 저장
- **localStorage/sessionStorage에 액세스 토큰 평문 저장 금지**(XSS로 탈취 가능).
- 권장: **httpOnly + Secure + SameSite 쿠키**(JS 접근 불가). 토큰 갱신은 서버에서.
- 클라이언트엔 최소 정보만. 민감 값은 서버 함수(`createServerFn`)/서버 라우트에서만 다룬다.

## CSRF
- 상태 변경 요청은 SameSite 쿠키 + CSRF 토큰(또는 double-submit) 병행.
- GET으로 상태를 바꾸지 않는다.

## 환경변수 노출
- **`VITE_` 접두(`import.meta.env`)는 브라우저 번들에 그대로 노출**된다 → 비밀값(시크릿/DB URL/서버 키)을 절대 넣지 않는다.
- 서버 전용 값은 접두 없이 두고 서버 함수(`createServerFn`)의 `process.env`에서만 접근.

## 기타
- 외부 링크 `target="_blank"` 에는 `rel="noopener noreferrer"`.
- 의존성 취약점은 `<pm> audit`로 주기 점검.
- 하드코딩된 API 키/시크릿 금지(→ `secret-scan` 훅이 저장 시 자동 경고).

## 체크리스트
- [ ] 외부 HTML 주입 시 sanitize
- [ ] 토큰을 httpOnly 쿠키에 보관(로컬스토리지 아님)
- [ ] `VITE_`(클라 노출 env)에 비밀값 없음
- [ ] `target="_blank"` + `rel="noopener noreferrer"`
- [ ] 상태 변경은 CSRF 보호
