<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial task:
- Run `npx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

# AGENTS.md — 프로젝트 durable context

> 이 파일은 **프로젝트별로 채워 유지**하는 지속 컨텍스트다. 스캐폴드 직후 아래 빈칸을 채우고,
> 스택/환경/배포/결정이 바뀔 때마다 갱신한다. (팀 공통 규칙은 루트 `CONVENTIONS.md`가 단일 진실원)

## 프로젝트 목적
개인 기술 블로그(포트폴리오 겸용). Notion에 써둔 CS/개발 학습 노트를 CMS로 삼아, 이 사이트가 Notion API로
읽어와 렌더링한다. **한 번 Docusaurus로 갔다가 다시 이 TanStack Start 커스텀 빌드로 되돌아온 프로젝트** —
Docusaurus는 디자인이 기본값이라 빨랐지만 "직접 디자인한 포트폴리오"로서의 가치가 떨어진다고 판단해 복귀함.
디자인은 특정 브랜드/디자인 시스템을 그대로 베끼지 않고, 이 블로그 콘텐츠(장문 CS/코드 위주 기술 글)에 맞게
직접 판단해서 만듦: 무채색 배경 + 액센트 하나, 넉넉한 본문 타이포(가독성 우선), 코드블록 실제 문법강조.

## 스캐폴드에 사용한 정확한 명령
```bash
npx @tanstack/cli@latest create tech-blog \
  --framework React --toolchain biome --package-manager npm \
  --add-ons shadcn,tanstack-query --intent --git --yes
```
이후 `tanstack-start` 템플릿 저장소의 `apply-template.sh`로 `.claude/`, `CONVENTIONS.md`, `biome.jsonc`,
`.env.example`을 복사하고 `/bootstrap` 절차를 수동 수행함. `@tanstack/intent install`은 대화형 터미널에서
사람이 직접 1회 실행 필요(권한 확인 프롬프트라 에이전트가 자동화 불가) — 아래 "다음 단계" 참고.

## 선택한 스택 · 통합
- 프레임워크: TanStack Start (**전체 SSG(prerender)** — `vite.config.ts`의 `tanstackStart({ prerender: { enabled: true, crawlLinks: true } })`. 인증 없는 공개 블로그라 요청별로 달라지는 라우트가 없고, `content/`는 `sync-notion` 시점에 이미 고정되므로 빌드 타임에 전체를 정적 HTML로 구움 — SEO/초기 페인트에 가장 유리하고 런타임 서버 실행 자체가 불필요)
- 라우팅: TanStack Router (파일 기반, `_blog.tsx` pathless layout + `_blog.index.tsx`/`_blog.posts.$slug.tsx`)
- 서버 상태: TanStack Query
- UI: shadcn/ui + Tailwind v4 (`components.json` aliases `@/`로 통일) — 단, shadcn 컴포넌트는 아직 실제로 추가 설치한 것 없음(직접 CSS로 디자인)
- 콘텐츠 소스: **Notion API** (`@notionhq/client`, 서버 함수에서만 호출)
- 마크다운 렌더링: `react-markdown` + `remark-gfm` + `rehype-raw`(Notion 마크다운에 섞인 진짜 HTML 통과용) +
  `rehype-pretty-code`(Shiki 기반 코드블록 문법강조 — 이 블로그 콘텐츠가 코드 위주라 색 테마보다 우선순위 높음)
- 테스트: Vitest + Playwright — `/bootstrap`에서 신규 생성, 아직 테스트 파일 0개
- 린트·포맷: **Biome** `^2.5.14` (`biome.jsonc`)
- 패키지 매니저: **npm**
- alias: `@/*` → `./src/*` 단일화, `#/` 배선은 애초에 미사용이라 제거함

## 환경변수 요구
<!-- 앱 서버(runtime)는 이제 Notion을 몰라서 이 변수들이 필요 없음 — sync-notion 스크립트 실행 시에만 필요 -->
| 변수 | 위치 | 용도 | 필수 |
|------|------|------|------|
| `NOTION_API_KEY` | `sync-notion` 스크립트 전용 | notion.so/my-integrations 발급 통합 시크릿 | sync 시에만 필수 |

## Notion 콘텐츠 소스 규칙 (데이터베이스 미사용 — 페이지 태그 기반, 실제 운영 중)
- 데이터베이스 없음. `sync-notion`이 `notion.search()`로 **integration에 공유된 페이지 전체**를 뒤져서
  제목이 `[front]`/`[back]`/`[cs]`/`[algo]`/`[network]`/`[infra]`/`[ai]` 태그로 시작하는 페이지만
  "카테고리 루트"로 인식한다(`scripts/sync-notion.mjs`의 `TAG_TO_CATEGORY`).
- 새 글을 사이트에 올리려면: (1) 페이지를 integration과 공유 (2) 카테고리 루트가 될 최상위 페이지라면
  제목 앞에 태그를 붙임. 하위 페이지는 태그 없이 그냥 자식 페이지로 만들면 `children.list` 재귀로 자동 포함됨.
- 대분류 카테고리(사이드바 그룹핑 기준)는 태그 → 한글 카테고리명 매핑으로 고정: 프론트엔드/백엔드/CS/
  자료구조&알고리즘/AI/네트워크/인프라.
- 페이지가 "웹에 게시(Publish to web)" 상태가 아니면 본문(`notion-client`의 `getPage`)을 못 받아와서
  sync 시 건너뛴다(트리에는 안 잡힘). 공유만 하고 게시를 안 하면 이 케이스에 해당.

## 콘텐츠 파이프라인 (중요 — 런타임에 Notion API 안 부름)
- **`npm run sync-notion`**이 Notion → `content/posts/*.json`으로 다운로드. 트리 구조(어떤 페이지가
  있는지)는 공식 API(`@notionhq/client`)로, 페이지 실제 내용은 `notion-client`(`NotionAPI.getPage`)로
  react-notion-x가 그대로 렌더링할 원시 블록 데이터(`ExtendedRecordMap`)를 받아 JSON으로 저장한다.
  이 스크립트를 돌릴 때만 Notion API 호출. 앱 서버는 그 로컬 JSON 파일만 읽음(`posts-store.ts`).
- 같이 생성되는 `content/icons.json`(페이지 아이콘), `content/page-ids.json`(페이지 간 멘션 링크를
  우리 사이트 slug로 바꾸는 매핑), `content/category-map.json`(카테고리 루트→카테고리), `content/order.json`
  (노션 원래 배치 순서)도 전부 sync 산출물.
- **`content/`는 git에 커밋함**(gitignore 안 함) — 배포 시 Notion 시크릿·API 접근 없이도 빌드 가능하고,
  콘텐츠 변경 이력이 git log로 남는 장점 때문에 의도적으로 선택함.
- 글 수정/추가 후 사이트에 반영하려면 `npm run sync-notion` → 커밋 → 배포 순서.
- `posts-api.ts`/`posts-store.ts`는 Notion을 전혀 모름(순수 로컬 파일 서버 함수) — Notion 관련 로직은
  전부 `scripts/sync-notion.mjs`에 격리됨.

## 핵심 아키텍처 결정
- **렌더링**: 전체 SSG(prerender, `vite.config.ts`). 글 목록/상세는 라우트 loader에서 서버 함수로 로컬 파일을 읽어오지만, 빌드 타임에 `crawlLinks`로 전체 라우트를 미리 다 돌아서 정적 HTML로 구움 → 배포 후엔 런타임 서버 실행 없이 정적 파일만 서빙됨. 단, 새 글 반영하려면 `sync-notion` → 재빌드 → 재배포까지 해야 함(런타임에 콘텐츠가 안 바뀌므로).
- **인증**: 없음 — 공개 개인 블로그.
- **Notion 마크다운 전처리 필수** (`src/features/posts/lib/notion-markdown-transform.ts`):
  1. `<page url="...">제목</page>`(Notion 전용 커스텀 태그, 페이지 멘션) → 마크다운 링크 `[제목](url)`로 변환.
     **반드시 앞뒤에 빈 줄을 강제로 넣어야 함** — 안 그러면 바로 위 `<table>` 같은 raw HTML 블록에 CommonMark가
     이어붙여서 링크 문법으로 안 바뀌고 텍스트로 남아버림(실제로 이 버그를 겪고 고침).
  2. `react-markdown`에 `rehype-raw` 없이는 Notion이 내보내는 진짜 HTML(`<table>`, `<details>` 등)이 안 보임.
- **API 위치**: 별도 백엔드 없음 — 서버 함수가 Notion API를 직접 호출하는 BFF.

## 알려진 함정 (gotchas)
- 코드블록 문법강조(rehype-pretty-code)가 일부 블록에서 언어 감지 못 하고 `plaintext`로 폴백됨 —
  Notion 원본에서 `<details><summary>` 토글 안에 들어있는 코드펜스가 원인으로 보임(raw HTML 블록
  안에서 CommonMark가 펜스 언어 태그를 못 살리는 케이스, `<page>` 멘션 버그와 같은 계열). 격리
  테스트(순수 마크다운 ```javascript 펜스)로는 정상 동작 확인함 — 파이프라인 자체 버그 아님.
  고치려면 `<details>` 안 코드펜스만 따로 앞뒤 빈 줄 강제 삽입하는 전처리 추가 필요(아직 미착수).
- Notion API 키는 서버(sync 스크립트) 전용 — `VITE_` 접두 붙이면 클라 번들에 노출되므로 절대 금지.
- 새 카테고리 루트/하위 페이지를 만들 때마다 그 페이지(또는 상위 페이지)에 통합(Integration)을
  "연결(공유)" 안 하면 `notion.search()`에 안 잡혀서 sync 결과에서 빠진다.
- Windows에서 `npm run dev`/`build` 후 남은 백그라운드 프로세스(vite/biome LSP 등)가 프로젝트 폴더를 잠가서
  `rm -rf` 실패하는 경우 있음 — `netstat -ano`/`Get-CimInstance Win32_Process`로 해당 PID 찾아서 kill 후 재시도.
- shadcn CLI로 컴포넌트 추가 시 `components.json`이 이미 `@/`로 설정돼 있어 `@/` import로 생성됨.

## 디자인 방향 (2026-09-22 — Notion 디자인 시스템 분석 스펙 적용으로 변경)
- 한때 "특정 디자인 시스템 안 베끼고 직접 판단"으로 갔다가, 사용자가 다시 명시적으로 Notion 스펙
  적용을 요청해서 **현재는 Notion 마케팅 사이트 분석 스펙의 토큰(색/타이포/라운드)을 적용한 상태**.
  (Notion 자체가 "따뜻한 무채색 캔버스 + 블루 액센트 1개 + 스티커 팔레트는 장식 전용"이라는 방향이라
  이전의 "직접 판단" 방향과 실제로는 크게 다르지 않게 귀결됨.)
- 배경은 순백이 아니라 살짝 따뜻한 오프화이트(`--background: #f6f5f4`, canvas-soft) — 카드/서피스는 흰색
- 액센트는 Notion Blue(`#0075de`) 하나만 링크·활성 상태에 사용, 스티커 팔레트(sky/purple/pink/orange/
  teal/green/brown)는 태그 점(dot)처럼 순수 장식에만 사용(`tag-colors.ts`)
- 타이포 스케일은 스펙의 heading-1(40px)/heading-2(26px)/heading-3(22px)/title(20px)/body-md(16px)/
  body-sm(15px)/caption(14px)/eyebrow(12px)를 그대로 매핑, NotionInter 대체 폰트는 Inter + 스펙이
  명시한 음수 letter-spacing 값 적용
- 본문(article) 폭은 사이드바와 별개로 제한(가독성) — 화면 꽉 채우지 않음
- 사이드바: `ex-app-shell-row` 패턴(활성 상태 = primary色 텍스트 + 옅은 배경 인디케이터)
- 코드블록 문법강조(rehype-pretty-code+Shiki)는 스펙에 없는 부분이라 그대로 유지 — 콘텐츠가 코드
  위주라 색 테마보다 우선순위 높다고 판단함

## 다음 단계
- [ ] `npx @tanstack/intent@latest install`을 **대화형 터미널에서 직접 실행**
- [ ] `npx playwright install`로 E2E 브라우저 바이너리 설치
- [ ] 실제 단위/E2E 테스트 작성(현재 설정 파일만 존재, 테스트 파일 0개)
- [ ] 배포 타깃 결정(Vercel 추천 — TanStack Start 공식 지원)
