# .claude — 팀 공통 Claude Code 설정

신규 프론트엔드 프로젝트에 **복사해서 그대로 작동**하는 공통 설정. 스킬·커맨드·훅·에이전트로 Claude의 동작을 제어하고, 팀 컨벤션을 자동으로 지키게 한다.

대상 스택: **TanStack Start (SPA 모드 기본 · selective SSR) + TanStack Router + TanStack Query + TanStack Form + nanostores + TypeScript + shadcn/ui + Tailwind v4** (린트·포맷: Biome / 테스트: Vitest + Playwright).

## 프로젝트 부트스트랩 (권장)

신규 프로젝트는 **TanStack CLI로 먼저 스캐폴드**한 뒤 이 설정을 얹는다.

1. **TanStack Start 스캐폴드** (React, blank starter, 기본 CLI 툴체인 — 추가 통합/기능 스캐폴딩 없음):
   ```bash
   npx @tanstack/cli@latest create my-tanstack-app --agent --package-manager <PM> --tailwind
   # <PM>: bun(팀 기본, 권장) | pnpm | yarn | npm — 프로젝트에서 쓸 PM으로 교체
   # CLI 일회성 호출기(npx/bunx/pnpm dlx)는 무엇이든 무방
   ```
   특정 PM을 고정하지 않는다. 신규 생성이라 값 자체는 필요하지만 팀/프로젝트가 선택한다.
2. **호스트 플랫폼이 자체 템플릿/커스텀 스타터로 시작하더라도**, 별도 scratch 디렉토리에서 위 CLI를 실행하고 그 생성물(통합·의존성·config·scripts·관련 파일 구조)을 실제 프로젝트에 **병합**한다. 자체 부트스트랩을 한다는 이유로 요청된 파트너 통합/스택 선택을 **드롭하지 말 것** — 최종 프로젝트에 어떤 식으로든 반영하거나, 반영 불가한 항목은 이유와 함께 **명시**한다.
3. **스캐폴드 후 TanStack Intent 설치·확인**:
   ```bash
   npx @tanstack/intent@latest install
   npx @tanstack/intent@latest list
   ```
   아키텍처/라이브러리 관련 변경 전에는 **설치된 TanStack Intent 스킬과 패키지 동봉 가이드를 먼저 참조**한다. 동봉 스킬이 현재 패턴을 알려줄 수 있으면 추측하지 않는다.
4. **생성된 프로젝트 구조는 명확한 이유가 없으면 보존**한다.
5. **스택 배선** — 스캐폴드 기본과 다를 수 있으니 반드시 확인·설정한다. **이 단계를 건너뛰면 아래 스택이 무음으로 no-op 된다**(문서·훅은 전제하지만 실제로 안 켜짐):
   - **SPA 모드**: `vite.config`의 `tanstackStart({ spa: { enabled: true } })`로 켠다(정적 셸 + 클라 렌더 → CDN). 상세·SSR 예외는 `rendering-strategy` 스킬.
   - **Biome**: **동봉된 `biome.jsonc`**을 프로젝트 루트에 복사(프로젝트 Biome 버전이 다르면 `biome migrate`로 맞춤). 스캐폴드가 깐 prettier/eslint는 제거(안 지우면 포맷 훅이 조용히 prettier로 폴백).
   - **테스트**: Vitest(+`@testing-library/react`, jsdom)·Playwright 설치 후 `vitest.config.ts`/`playwright.config.ts` 생성.
   - **`@/` alias**: `tsconfig.json`의 `paths`와 `vite.config`의 `resolve.alias`에 `@/* → src/*`(스캐폴드가 넣어주면 확인만).
   - **`.env`**: **동봉된 `.env.example`**을 복사해 값을 채우고, 실제 `.env`는 gitignore(커밋 금지).
6. **환경변수 원칙**: 클라이언트 노출값만 `VITE_` 접두(`import.meta.env`, 번들에 박힘), 시크릿·서버 전용은 접두 없이 `createServerFn()`의 `process.env`(서버에서만). 실제 변수 목록은 `AGENTS.md`의 env 표에 채운다.
7. **프로젝트 durable context는 `AGENTS.md`에 유지**한다(루트 `AGENTS.md` 템플릿 참고). 사용한 정확한 CLI 명령, 후속 Intent 명령, 선택한 스택·통합, 환경변수 요구, 배포 노트, 핵심 아키텍처 결정, 알려진 함정, 다음 단계를 채운다.

## 도입 방법

**권장 — 스크립트로 복사 후 `/bootstrap`** (스캐폴드한 프로젝트 안에서):
1. `bash /path/to/claude-template/apply-template.sh` — `.claude/`·`CONVENTIONS.md`·`AGENTS.md`·`biome.jsonc`·`.env.example` 복사 + 훅 실행권한 + `settings.local.json` 생성 + commit-msg 링크(파일 복사만).
2. Claude Code에서 **`/bootstrap`** 실행 — 의존성 설치·SPA 모드·Biome(스캐폴드 prettier/eslint 제거)·테스트 config·`@/` alias·TanStack Intent·`AGENTS.md` 채우기를 Claude가 처리.

**수동으로 하려면**: 위 "프로젝트 부트스트랩" 섹션의 단계를 그대로 따른다. (`jq` 설치 권장 — 없으면 `node` 폴백. 훅 권한: `chmod +x .claude/hooks/*.sh .claude/hooks/lib/*.sh`.)

## 폴더 구조

```
apply-template.sh         # 파일 복사 스크립트 (복사만; 배선은 /bootstrap)
CONVENTIONS.md            # 팀 컨벤션 단일 진실원 (프로젝트 루트에 위치)
AGENTS.md                 # 프로젝트 durable context 템플릿 (채워서 유지)
biome.jsonc                # 린트·포맷 설정 (팀 표준)
.env.example              # 환경변수 템플릿 (→ .env 로 복사, .env 는 커밋 금지)
.claude/
├── settings.json                 # 권한·훅·환경변수
├── settings.local.example.json   # 로컬 설정 템플릿 → settings.local.json 으로 복사
├── .gitignore
├── README.md                     # 이 문서
├── CLAUDE.md                     # Claude가 읽는 컨벤션 요약
├── hooks/
│   ├── skill-eval.sh / skill-eval.js      # 스킬 자동 추천
│   ├── skill-rules.json / *.schema.json   # 추천 규칙 + 스키마
│   ├── pre-edit-guard.sh                  # main 보호 + 컨벤션 검사
│   ├── post-edit.sh                       # 저장 시 포맷 + 시크릿 스캔
│   ├── git/commit-msg                     # (선택) 커밋 메시지 형식 검사 git 훅
│   └── lib/
│       ├── json.sh          # stdin JSON 파싱 헬퍼
│       ├── pm-detect.sh     # 패키지 매니저/포맷터 감지
│       ├── naming-check.sh  # kebab-case·경로 규칙 검증
│       ├── secret-scan.sh   # 시크릿/자격증명 하드코딩 감지
│       └── git-host-detect.sh # 원격 호스트 감지(GitHub gh/PR · GitLab glab/MR)
├── skills/                  # project-conventions, component-design, shadcn-ui, react-query,
│                            # api-layer, auth, loading-error, rendering-strategy, security,
│                            # state-management, systematic-debugging, testing,
│                            # web-accessibility, tanstack-form, design-tokens
├── commands/                # /bootstrap · /conventions · /code-quality · /pr-summary · /pr-review · /docs-sync · /onboard
└── agents/                  # code-reviewer
```

## settings.json — 훅 구성

| 이벤트 | 매처 | 스크립트 | 동작 |
|--------|------|----------|------|
| `UserPromptSubmit` | — | `skill-eval.sh` | 프롬프트 분석 → 관련 스킬 추천 |
| `PreToolUse` | `Edit\|MultiEdit\|Write` | `pre-edit-guard.sh` | `main`/`master` 편집 차단(exit 2) + 새 파일 컨벤션 검사(기본 경고) |
| `PostToolUse` | `Edit\|MultiEdit\|Write` | `post-edit.sh` | ①파일 포맷(감지된 formatter/PM) ②시크릿 스캔(비차단 경고). import 순서는 Biome `organizeImports`가 담당 |

> **git commit-msg 훅**(선택): 커밋 메시지의 타입·형식·길이를 검사한다. Claude Code 훅이 아니라 git 훅이므로 대상 프로젝트에서 별도 설치한다(아래 참고).

**핵심 설계**
- 훅은 도구 정보를 **stdin JSON**에서 읽는다(`lib/json.sh`). Claude Code는 파일 경로를 환경변수로 주지 않으므로, 존재하지 않는 `$CLAUDE_TOOL_INPUT_FILE_PATH` 같은 변수에 의존하지 않는다.
- 패키지 매니저·포맷터는 **락파일/설정으로 감지**한다(하드코딩 없음). 락파일이 없으면 **bun**이 기본, 단 **모노레포**(pnpm-workspace/turbo/nx/lerna/`workspaces`)면 **pnpm**.
- PostToolUse는 **파일 단위 포맷만** 한다. 전체 `tsc --noEmit`은 무거워서 `/code-quality` 커맨드·CI로 이관.
- 차단은 `exit 2`+stderr, 비차단은 `exit 0`.

### 토글: 컨벤션 위반 시 차단
기본은 **경고(비차단)**. 강제 차단하려면 `settings.local.json`(또는 환경)에서:
```json
{ "env": { "CLAUDE_NAMING_BLOCK": "1" } }
```

### 팀 정책: includeCoAuthoredBy
`settings.json`의 `"includeCoAuthoredBy"`로 커밋의 AI 공동작성자 표기를 켜고 끈다. 기본값 `false`. 팀 정책에 맞게 조정.

## git commit-msg 훅 설치 (선택)

커밋 메시지의 타입/형식/길이(`<type>: 제목`, 50자)를 검사한다. Claude Code가 아니라 git이 실행하므로 대상 프로젝트에서 설치한다.

```bash
# 프로젝트 루트에서
chmod +x .claude/hooks/git/commit-msg
ln -sf ../../.claude/hooks/git/commit-msg .git/hooks/commit-msg
```
husky를 쓰면 `.husky/commit-msg`에서 이 스크립트를 호출한다. 위반 시 커밋이 차단된다(git 훅 규약: exit 1).

## 자동화 흐름

```
프롬프트 입력 → skill-eval.sh (stdin JSON) → skill-rules.json 점수화 → 관련 스킬 추천

파일 저장 → PreToolUse: main 보호 + 컨벤션 검사
          → PostToolUse: 감지된 포맷터로 파일 포맷
```

## 스킬/커맨드/에이전트 추가
- 스킬: `skills/<이름>/SKILL.md` + `skill-rules.json` 규칙. **폴더명 = frontmatter name = rules 키** 3중 일치 필수(`skills/README.md`).
- 커맨드: `commands/<이름>.md` → `/<이름>`.
- 에이전트: `agents/<이름>.md`.

## 요구 사항
- Node.js (스킬 추천 엔진). 없으면 추천만 조용히 비활성.
- `jq` 권장(없으면 node 폴백).
- 린트·포맷터는 **Biome(팀 표준)**. 프로젝트에 `biome.jsonc`이 있으면 포맷 훅이 Biome로 동작한다(없으면 prettier 폴백, 그마저 없으면 조용히 무시).
