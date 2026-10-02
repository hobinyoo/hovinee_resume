---
description: 복사된 팀 설정을 실제 프로젝트에 배선한다 — 의존성·SPA 모드·Biome·테스트·@/ alias·TanStack Intent·AGENTS.md.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# 프로젝트 부트스트랩

`apply-template.sh`로 팀 설정 파일이 **이미 복사된** 프로젝트다. 아래를 **순서대로** 수행하고 각 단계 결과를 짧게 보고한다. 파일 삭제 등 **파괴적 변경 전에는 무엇을 지울지 먼저 보여주고** 진행한다.

## 0. 파악
- `CONVENTIONS.md`·`AGENTS.md`·`.claude/README.md`를 읽어 팀 스택·규칙을 파악.
- 락파일로 패키지 매니저 감지(`.claude/hooks/lib/pm-detect.sh`). 이하 `<pm>`/`<pm-dlx>`는 감지값으로.
- **Node는 최신 LTS 사용.** `nvm install --lts`(또는 `fnm install --lts`)로 최신 LTS 설치·전환하고, **결정된 major를 `.nvmrc`에 기록**해 팀 통일(현재 최신 LTS = **24**; LTS는 항상 짝수라 `>=22.12`·`>=24` engine을 늘 만족). 정적 `.nvmrc`를 미리 넣지 말고 이 시점에 생성한다. (자동 추적을 원하면 `.nvmrc`에 `lts/*` — 단 일부 버전매니저만 해석)
  - 배경: `@tanstack/react-start`가 `>=22.12` 요구. Node 20은 react-start EBADENGINE, 23·25(홀수)는 vitest EBADENGINE. `EBADENGINE` 뜨면 최신 LTS 안내.

## 1. dev 의존성 설치 (Biome는 최신으로)
`<pm> add -d @biomejs/biome@latest @playwright/test`
- **Biome는 항상 `@latest`로 설치/업그레이드**한다. 스캐폴드가 구버전(예: 2.4.x)을 고정해뒀으면 최신으로 올린다(우리 `biome.jsonc`는 최신 기준).
- Vitest·`@testing-library/*`·jsdom은 TanStack 스캐폴드에 **이미 포함**된 경우가 많다 → 없을 때만 추가.

## 2. SPA 모드
- `vite.config.*`의 `tanstackStart(...)` 호출에 `{ spa: { enabled: true } }`를 추가(`rendering-strategy` 스킬 기준).

## 3. Biome로 통일
- `biome.jsonc`(복사됨)을 설정 소스로 확정. Biome는 **최신 버전 기준**이며, 스캐폴드가 자체 `biome.json`을 만들었으면(toolchain=Biome 선택 시) 그걸 지우고 우리 `biome.jsonc`로 통일한다.
- 스캐폴드가 깐 **prettier/eslint 제거**(`.eslintrc*`·`.prettierrc*`·관련 devDeps·package.json의 lint/format 스크립트). **지우기 전에 목록을 사용자에게 보여준다.**
- package.json scripts: `"format": "biome format --write"`, `"lint": "biome lint"`, `"check": "biome check"` (lint ≠ check — check는 format+import까지 함). 경로 인자는 생략(최신 Biome은 config 범위로 동작).

## 4. 테스트 config
- `vitest.config.ts` 생성(jsdom 환경, `@testing-library/jest-dom` setup, `@/` alias 공유).
- `playwright.config.ts` 생성(기본). package.json: `"test": "vitest run"`(1회 실행; watch는 `"test:watch": "vitest"`), `"test:e2e": "playwright test"`. 스캐폴드에 이미 `test` 스크립트가 있으면 존중하되 `vitest run` 형태로.

## 5. @/ alias (팀 표준 = `@/`)
- TanStack엔 단일 공식 alias가 없다(문서마다 `~/`·`@/`, CLI는 `#/`+`@/`). 팀 표준은 **`@/`**(shadcn·생태계 친숙도).
- `tsconfig.json` `compilerOptions.paths`에 **`"@/*": ["./src/*"]`가 없으면 추가**(스캐폴드는 보통 넣어줌). Vite는 `resolve: { tsconfigPaths: true }`면 인식.
- **shadcn `components.json` aliases가 `#/`(또는 `~/`)면 `@/`로** 바꾼다(예: `#/lib/utils` → `@/lib/utils`) → 이후 shadcn CLI가 `@/`로 생성.
- **기존 코드의 `#/` import도 `@/`로 변환**한다(스캐폴드 생성 파일 포함). `grep -rn "#/" src`로 잔여 확인.
- ⚠️ **`#/` 배선 제거는 "완전 변환 + 검증 통과" 후에만.** `package.json`의 `imports` 필드와 `tsconfig`의 `#/*`가 `#/`를 정의한다. **코드에 `#/`가 하나도 안 남고 `tsc --noEmit`·`build`가 통과할 때만** 이 둘을 지워 `@/`로 완전 일원화한다. **확신 없으면 `#/` 배선은 그대로 둔다(무해)** — 사용처가 남았는데 정의만 지우면 깨진다.

## 6. env · .gitignore
- **`.gitignore` 보장**: 스캐폴드가 만든 루트 `.gitignore`를 확인하고, 없으면 생성한다. 아래 항목이 **누락됐으면 추가**(스캐폴드 생성분을 덮어쓰지 말고 병합):
  - **env**: `.env`, `.env.*` (단 `!.env.example`) — 시크릿 커밋 방지.
  - **macOS**: `.DS_Store`, `._*`, `.Spotlight-V100`, `.Trashes` 등.
  - **Windows**: `Thumbs.db`, `Desktop.ini`, `$RECYCLE.BIN/`.
  - **에디터**: `.idea/`, `*.swp`, `.vscode/*`(단 `!.vscode/extensions.json`·`!.vscode/settings.json`).
  - **산출물·캐시**: `node_modules/`, `dist/`, `.output/`, `.vinxi/`, `.nitro/`, `.tanstack/`, `.vite/`, `*.tsbuildinfo`.
  - **로그·테스트·커버리지**: `*.log`, `coverage/`, `playwright-report/`, `test-results/`.
- **이미 커밋된 OS 파일 정리**: `.DS_Store` 등이 추적 중이면 `git rm --cached`로 언트랙(작업 트리 파일은 유지). 예: `git ls-files | grep -E '(^|/)\.DS_Store$' | xargs -r git rm --cached`.
- `.env.example` 키를 실제 필요에 맞게 조정.

## 7. TanStack Intent
- `<pm-dlx> @tanstack/intent@latest install` → `<pm-dlx> @tanstack/intent@latest list`. 설치된 스킬/가이드를 확인하고, 이후 아키텍처 결정 시 먼저 참조한다.

## 8. AGENTS.md 채우기 (프로젝트별 결정은 **질문**한다)
- 자동으로 아는 것(사용한 CLI 명령·PM·스택·env·SPA 모드 등)은 바로 `AGENTS.md`에 채운다.
- **아직 안 정한 프로젝트별 항목은 사용자에게 질문**하고 답을 기록한다. 모르면 "미정"을 답으로 허용(강제로 정하게 하지 말 것):
  - **인증 방식** — 자체 세션 쿠키 / OAuth(구글 등) / Clerk·Auth0·Supabase / 사내 SSO, 그리고 권한·롤 구분
  - **배포 타깃** — Vercel / Netlify / 정적 호스팅(S3+CDN) / 사내 nginx 등, 빌드·환경변수 주입 방식
  - **API base URL / 백엔드** 위치, 그 외 AGENTS.md의 빈 항목
- **TanStack Intent가 생성한 AGENTS.md가 이미 있으면**(스킬 매핑 포함) 덮어쓰지 말고, 우리 durable-context 섹션을 **덧붙여 병합**한다.

## 마무리
- 한 일을 요약하고, 질문 결과와 아직 **"미정"으로 남은 항목**을 다시 짚어준다.
