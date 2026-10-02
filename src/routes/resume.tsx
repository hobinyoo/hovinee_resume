import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

export const Route = createFileRoute("/resume")({
  component: Resume,
})

const SECTIONS = [
  { id: "basic-info", label: "기본 정보", Component: BasicInfoTab },
  { id: "intro", label: "자기소개", Component: IntroTab },
  { id: "tech-stack", label: "기술 스택", Component: TechStackTab },
  { id: "career", label: "경력", Component: CareerTab },
  { id: "projects", label: "프로젝트", Component: ProjectsTab },
  { id: "portfolio", label: "포트폴리오", Component: PortfolioTab },
  { id: "education", label: "교육", Component: EducationTab },
  { id: "certificates", label: "자격증", Component: CertificatesTab },
] as const

const TECH_STACK = [
  "React",
  "React Native",
  "TypeScript",
  "TailwindCSS",
  "react-query",
  "Firebase",
  "MongoDB",
  "zustand",
  "Python",
  "Java",
  "Spring Boot",
  "JavaScript",
]

const CAREERS = [
  {
    company: "아크로퓨처",
    role: "대리 • IT서비스사업팀",
    duties: [
      "현대오토에버 프로젝트 - 네비게이션 관리자 통합 대시보드 및 대외사업 웹 포털 프론트엔드 개발",
      "현대오토에버 프로젝트 - 차량용 네비게이션 서비스 운영 및 유지보수",
      "AI 도구(Claude Code) 활용 전반적인 개발 생산성 향상",
    ],
    period: "2025.10. ~ 재직 중",
    duration: "1년 1개월 | 정규직",
  },
  {
    company: "듀코젠",
    role: "사원 • 개발팀",
    duties: [
      "교육 기관 대상 LMS(학습관리시스템) 웹 애플리케이션 개발 및 운영",
      "Unity WebGL 기반 교육용 메타버스 플랫폼 프론트엔드 개발",
      "AI 기반 심리상담 서비스 프론트엔드 개발",
    ],
    period: "2023.09. ~ 2025.10.",
    duration: "2년 2개월 | 정규직",
  },
  {
    company: "코코넛사일로",
    role: "사원 • 개발팀",
    duties: [
      "Kokkok Express 운송 플랫폼의 크로스 플랫폼 앱 유지보수 및 신규 기능 개발",
      "Truck Doctor 정비 서비스 앱의 타입스크립트 마이그레이션 및 유지보수",
    ],
    period: "2023.03. ~ 2023.05.",
    duration: "3개월 | 계약직",
  },
  {
    company: "파프리카 인더스트리",
    role: "사원 • 개발팀",
    duties: [
      "Fatal Bomb 브랜드 공식 홈페이지 반응형 웹 개발 및 UI/UX 구현",
      "CJ 프로젝트 - Unity WebGL 기반 가상 패션 메타버스 웹 플랫폼 개발",
    ],
    period: "2022.09. ~ 2023.02.",
    duration: "6개월 | 정규직",
  },
]

const PROJECTS = [
  {
    org: "아크로퓨처",
    name: "국내 차량용 네비게이션 서비스 운영",
    description: "현대 국내 차량용 네비게이션 서비스 운영 및 AI 도구를 활용한 운영 환경 개선",
    contributions: [
      "Java MVC 기반 운영 서비스 코드 분석 및 유지보수",
      "Kubernetes · Redis · 인프라 주요 지표 모니터링 및 일일 점검",
      "Python 기반 운영 모니터링 도구 개발로 반복적인 일일 점검 업무 자동화",
      "Python + Flask API 기반 정기 운영 업무 자동화",
      "Docker Compose 기반 로컬 개발 환경 표준화",
    ],
    stack: "Java, Python, Flask, Docker",
    period: "2026.02. ~ 진행 중",
  },
  {
    org: "아크로퓨처",
    name: "통합 네비게이션 대시보드 및 웹 포털 서비스",
    description: "현대 네비게이션 서비스 관리자 대시보드 및 외부 기업 대상 POI 데이터 유통 플랫폼",
    contributions: [
      "총 개발 인원: 6명 (기획 1, FE 3, BE 2) · 프론트엔드 담당",
      "현대 네비게이션 관리자 통합 대시보드 구축",
      "Recharts 기반 메인 대시보드 화면 구축 (10개 이상 지표 시각화)",
      "VOC 관리 화면 구축",
      "전 세계 CP사 POI 데이터 유통을 위한 대외사업 웹 포털 구축",
      "유저 권한 관리, 공지사항, 이벤트 관리 페이지 개발",
    ],
    stack: "React, TypeScript, Recharts",
    period: "2025.10. ~ 2026.02. (5개월)",
  },
  {
    org: "듀코젠",
    name: "이세계캠퍼스",
    description: "교육 콘텐츠를 기반으로 수강, 시청, 진도 관리를 제공하는 웹 기반 학습 플랫폼",
    contributions: [
      "총 개발 인원: 3명 (기획, FE 1, BE 1) · 프론트엔드 100% 담당, 서비스 기획 초기 단계부터 런칭까지 전 과정 참여",
      "페이지 설계부터 모노레포/결제시스템/웹접근성/CMS/LMS까지 전체 개발 프로세스 전담",
      "모노레포 도입을 통한 중복 개발 제거 및 재사용 가능한 LMS 플랫폼 구축",
      "토스페이링크 연동 및 구독 시스템 구축을 통한 수익화 기능 도입",
      "토스페이 API/웹훅 연동을 통한 실시간 결제 처리시스템 구축",
      "구독 시스템 DB 스키마 설계 및 백엔드 API 개발",
      "웹 접근성 적용을 통한 웹 표준 준수 및 사용자층 확대",
      "강의 수강 CMS 개발을 통한 통합 학습 환경 구현",
      "WYSIWYG 에디터 도입을 통한 강의 콘텐츠 품질 향상",
      "YouTube API 활용하여 영상 정보 자동 수집 및 강의 등록 효율성 향상",
      "TUS 프로토콜 및 Vimeo API 연동으로 안정적 영상 업로드 및 스트리밍 환경 구축",
      "Context API 및 Reducer 패턴으로 다양한 미디어 데이터 통합 상태 관리 구현",
      "대시보드, 수강생 관리, 강좌 어드민 페이지, 이메일 알림 등 종합적 학습 관리 시스템 개발",
      "Next.js SSR과 SWR 조합으로 상황별 최적 데이터 페칭 및 성능 개선",
      "모바일 전용 앱 구현 및 Middleware 자동 라우팅으로 멀티 플랫폼 지원",
      "JWT 토큰 및 쿠키 세션 기반 자동 로그인으로 사용자 편의성 및 보안성 향상",
      "성과: 6개 교육기관에서 300명 이상 사용하는 실운영 LMS 플랫폼 구축",
      "성과: 10개 이상의 공통 패키지 구축으로 코드 재사용률 및 개발 효율성 극대화",
      "성과: 웹 접근성 인증 서면 심사 승인",
    ],
    stack: "Next.js, React, Tailwind CSS, TypeScript, framer-motion, MongoDB, Turbo Repo, SWR",
    period: "2024.03. ~ 2025.10. (1년 8개월)",
    links: [
      { label: "ducowith.com", href: "https://www.ducowith.com/" },
      { label: "m.ducowith.com", href: "https://m.ducowith.com/" },
    ],
  },
  {
    org: "듀코젠",
    name: "메타케어교육동",
    description: "교육 콘텐츠 기반의 메타버스 플랫폼 웹 애플리케이션",
    contributions: [
      "총 개발 인원: 3명 (기획 1명, FE 1명, BE 1명) · 프론트엔드 100% 담당, 서비스 기획 초기 단계부터 개발 전반 참여",
      "아키텍처 설계부터 Unity 연동/상태관리/테스트까지 전체 개발 프로세스 전담",
      "React Unity WebGL 연동으로 웹 기반 3D 메타버스 환경 구축 및 서비스 제공",
      "WebGL API 활용한 3D 에셋 및 멀티미디어 콘텐츠(이미지/영상/PPT) 실시간 렌더링",
      "3D 커스텀 오브젝트(Asset/Portal/Memo) 좌표 기반 배치 제어 및 실시간 상호작용 환경 구현",
      "백엔드 API 연동을 통한 데이터 저장 및 동기화",
      "Cloudflare에서 AWS S3/CloudFront로 CDN 이전 및 최적화를 통한 Unity 빌드 다운로드 속도 85% 개선 (35초→5초)",
      "FSD 아키텍처 도입으로 코드 관리 효율성 및 개발 생산성 향상",
      "Jest/RTL/MSW 활용한 BDD 기반 주요 기능 테스트 환경 구축으로 서비스 안정성 개선",
      "외주 디자인사 협업을 통한 웹 기반 메타버스 환경 특화 UI/UX 디자인 도출",
    ],
    stack:
      "Next.js, React, TypeScript, Unity WebGL, Zustand, Jest, React Testing Library, MSW, AWS S3, CloudFront",
    period: "2025.10. ~ 진행 중",
  },
  {
    org: "듀코젠",
    name: "패스파인더",
    description: "chat gpt와 메타버스를 결합한 진로상담 및 교육 웹 어플리케이션입니다.",
    contributions: [
      "3D WebGL 렌더링을 위해 Unity 빌드를 웹 애플리케이션에 통합하여 사용자와의 인터랙션 기능 구현",
      "상담 프롬프트를 정의하고 ChatGPT API를 연동하여 AI 기반의 상담 기능 제공",
      "Figma를 이용해 디자인 및 기획자와 협업하여 페이지 UI/UX 설계 및 구현",
      "Cloudflare R2 스토리지와 비디오 스트리밍 API를 연동하여 이미지 및 비디오 업로드 및 렌더링",
      "구독 서비스 구현 및 Toss 결제 시스템 연동",
    ],
    stack: "Next.js, React, Tailwind CSS, Typescript",
    period: "2023.11. ~ 2024.01. (3개월)",
    links: [{ label: "도메인", href: "https://pathfinder-g2k4.vercel.app/" }],
  },
  {
    org: "코코넛사일로",
    name: "KOKKOK EXPRESS",
    description: "크로스 플랫폼을 지원하는 운송 모빌리티 앱입니다.",
    contributions: [
      "Android 및 iOS를 위한 React Native 기반의 크로스 플랫폼 앱 개발",
      "안정성과 유지보수를 위해 기존 코드베이스를 타입스크립트로 마이그레이션",
      "Figma를 사용한 모바일 UI/UX 디자인을 적용하여 사용자 경험 향상",
      "블루투스 기능 및 영수증 프린트 기능 구현",
      "Facebook 광고를 통한 앱 다운로드 유저 트래킹 및 광고 데이터 수집",
      "Firebase를 사용하여 앱 푸쉬 알림 서비스 구현",
      "React Native 패키지 버전 관리 및 최신화, 앱 배포 전 기능 테스트와 디버깅",
    ],
    stack: "React Native, TypeScript, Firebase, Redux Toolkit, Axios",
    period: "2023.03. ~ 2023.05. (3개월)",
  },
  {
    org: "파프리카 인더스트리",
    name: "KMFF",
    description: "CJ와 연계하여 개발한 가상 패션 메타버스 웹 서비스 입니다.",
    contributions: [
      "React Three Fiber(R3F)를 활용하여 3D 모델 파일(glb, gltf)의 렌더링 및 애니메이션 구현",
      "웹과 서버 간의 유저 데이터 통신 구현",
      "Redux Toolkit(RTK)을 도입하여 비동기 및 전역 상태 관리 시스템 구축",
      "Kakao, Naver, Google 소셜 회원가입 및 로그인 기능 구현",
      "디자이너와 협업하여 반응형 UI/UX 디자인 구성",
      "Socket.io를 사용하여 유저 간 실시간 채팅 기능 구현",
      "react-transition-group 라이브러리를 사용한 페이지 인터렉티브한 라우팅 애니메이션 적용",
      "외국인 이용자를 위한 Localization 기능 구현",
    ],
    stack: "React, TypeScript, Redux Toolkit, R3F, Axios, Styled-components",
    period: "2023.10. ~ 2024.02. (5개월)",
    links: [{ label: "참고 블로그", href: "https://blog.naver.com/hipguy-/222982284107" }],
  },
  {
    org: "스파르타코딩클럽 부트캠프(5기)",
    name: "짜여",
    description:
      "사용자가 여행 일정을 작성하고 공유할 수 있는 서비스로, 지도 서비스와 무한 스크롤, 푸시 알림 등을 통해 사용자 경험을 향상시킵니다.",
    contributions: [
      "팀 리더로서 프로젝트를 주도하고 백엔드 및 현직 디자이너와 협업",
      "Location API를 활용하여 Google Map 기반의 지도 서비스 개발",
      "검색 및 카테고리 쿼리를 적용한 무한 스크롤 기능 구현",
      "Progressive Web App(PWA) 적용으로 웹 푸시 알림 기능을 통해 사용자 접근성 향상",
      "Compression 이미지 라이브러리를 적용하여 렌더링 속도 개선",
      "AWS S3, CloudFront, Route53을 사용하여 웹 페이지 배포",
    ],
    stack: "React, Redux, Axios, Google Map SDK, Styled-components",
    period: "2021.11. ~ 2022.04. (6개월)",
    links: [
      {
        label: "데모영상",
        href: "https://www.youtube.com/watch?v=_0OfbAx8uzU",
      },
      {
        label: "포트폴리오",
        href: "https://drive.google.com/file/d/1nkIFjNRSrVTn7wcaF6X92mUB9f1p0yhQ/view",
      },
    ],
  },
  {
    org: "개인프로젝트",
    name: "부자되기",
    description: "자산·부채·투자를 통합 관리하고 RAG 기반 AI 투자 리포트를 제공하는 풀스택 개인 프로젝트",
    contributions: [
      "기여도: 풀스택 100% (기획 · 설계 · 개발 · 배포), Claude Code 활용",
      "[Backend] 자산/부채/투자 도메인 REST API 설계 및 구현 (QueryDSL 동적 필터링)",
      "[Backend] Yahoo Finance API 연동으로 국내외 주식 실시간 시세 및 평가금액 자동 산출",
      "[Backend] RAG 파이프라인 구축으로 AI 투자 리포트 자동 생성",
      "[Backend] 네이버 뉴스 API로 보유 종목 관련 기사 수집 및 Claude API 핵심 요약",
      "[Backend] Pinecone 벡터 DB 임베딩 저장 → 유사도 검색 기반 관련 뉴스 반환",
      "[Backend] Claude API로 포트폴리오 기반 투자 리포트 생성 (SSE 스트리밍)",
      "[Backend] 매일 자정 스케줄러로 자산 스냅샷 자동 저장 및 월 납입/상환 자동 처리",
      "[Backend] JWT HttpOnly 쿠키 기반 인증 (Access 15분 / Refresh 7일)",
      "[Backend] GitHub Actions CI/CD → Docker → EC2 배포",
      "[Frontend] 자산/부채/투자 관리 UI 및 대시보드 (Recharts 기반 자산 유형별 비율, 순자산 추이 차트)",
      "[Frontend] SSE 스트리밍 기반 AI 리포트 생성 진행률 실시간 표시",
      "[Frontend] React Query 기반 서버 상태 관리",
    ],
    stack:
      "Java, Spring Boot, Next.js, React, TypeScript, PostgreSQL, QueryDSL, Pinecone, Docker, AWS EC2, Recharts",
    period: "2026.03. ~ 진행 중",
    links: [
      { label: "백엔드", href: "https://github.com/hobinyoo/asset_backend" },
      { label: "프론트엔드", href: "https://github.com/hobinyoo/asset_frontend" },
      {
        label: "API 기능정의서",
        href: "https://github.com/hobinyoo/asset_backend/blob/main/docs/API_%EA%B8%B0%EB%8A%A5%EC%A0%95%EC%9D%98%EC%84%9C.md",
      },
    ],
  },
  {
    org: "개인프로젝트",
    name: "제주 가마솥 이커머스",
    description:
      "국밥을 판매하는 모바일 웹 이커머스 서비스로, 사용자가 쉽게 주문하고 관리할 수 있는 기능을 제공합니다.",
    contributions: [
      "외주 디자이너와 협업하여 로고, 회원가입, 로그인, 메인 페이지, 주문하기, 주문내역, 후기, 관리자 페이지 등 UI/UX 디자인 및 구현",
      "Firebase Authentication을 활용한 이메일 로그인 서비스 구현",
      "Cloud Firestore 및 Storage를 사용하여 고객 데이터 연동 및 패치",
      "Toss Payments를 통한 결제 시스템 구축",
      "Next.js 서버 API를 사용하여 풀스택 애플리케이션 구현",
      "React-Query를 도입하여 API 캐싱 및 데이터 패칭 최적화",
      "재사용 가능한 컴포넌트 및 기능 로직 모듈화",
    ],
    stack: "React, Next.js, Firebase, TypeScript, React-Query, Emotion",
    period: "2023.06. ~ 2023.07. (2개월)",
  },
  {
    org: "개인프로젝트",
    name: "나의 투두 리스트 만들기",
    description:
      "React Native로 개발한 투두 리스트 앱으로, 할일 리스트를 관리하고 수정할 수 있는 기능을 제공합니다.",
    contributions: [
      "Cloud Firestore를 사용하여 할일 리스트 저장 및 상세 페이지에서 수정 및 삭제 기능 구현",
      "react-navigation 라이브러리를 활용하여 화면 스택 관리 및 전환 처리",
      "react-native-gesture-handler 라이브러리를 사용하여 스와이프 제스처로 리스트 삭제 기능 구현",
      "StyleSheet API를 사용하여 직관적이고 사용자 친화적인 UI/UX 구현",
    ],
    stack: "React, React Native, TypeScript, Firebase",
    period: "2023.07. ~ 2023.07. (1개월)",
    links: [{ label: "Github", href: "https://github.com/hobinyoo/RN-TodoList" }],
  },
]

const EDUCATIONS = [
  {
    org: "스파르타코딩클럽",
    type: "사설 교육 | 프론트엔드 개발",
    period: "2021.11. ~ 2022.04.",
    status: "졸업",
  },
  {
    org: "청운대학교",
    type: "대학교(학사) | 연기예술학과",
    period: "2011.03. ~ 2017.09.",
    status: "졸업",
  },
]

const CERTIFICATES = [
  { name: "토익", score: "855", date: "2020.11." },
  { name: "토익스피킹", score: "6급", date: "2020.11." },
]

const PORTFOLIO_LINKS = [
  { label: "블로그", href: "https://hobinsky.tistory.com/" },
  { label: "깃허브", href: "https://github.com/hobinyoo" },
]

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="m-0 mb-6 text-heading-3 text-foreground">{children}</h2>
}

function BasicInfoTab() {
  return (
    <div>
      <SectionTitle>기본 정보</SectionTitle>
      <div className="flex flex-col gap-4 text-body-sm">
        <div>
          <p className="m-0 text-caption text-muted-foreground">이름</p>
          <p className="m-0 text-heading-1 text-foreground">유호빈</p>
        </div>
        <div>
          <p className="m-0 text-caption text-muted-foreground">직업</p>
          <p className="m-0 text-foreground">프론트엔드 개발자</p>
        </div>
        <div>
          <p className="m-0 text-caption text-muted-foreground">이메일</p>
          <a href="mailto:hobinskyy@naver.com">hobinskyy@naver.com</a>
        </div>
      </div>
    </div>
  )
}

function IntroTab() {
  return (
    <div>
      <SectionTitle>자기소개</SectionTitle>
      <div className="flex flex-col gap-4 text-body-sm text-foreground">
        <p className="m-0">
          5년차 프론트엔드 개발자로서 React와 Next.js를 기반으로 한 웹 애플리케이션 개발을 하고
          있습니다.
        </p>
        <p className="m-0">
          JavaScript와 브라우저 동작 원리, React 인터널까지 깊이 있게 학습하며 프론트엔드 본질에
          충실한 개발자를 지향합니다. 동시에 Java, Python, 서비스 인프라 등 프로덕트 전반으로
          역량을 넓혀가며, AI 도구를 분별력 있게 활용해 개발 생산성을 높이는 엔지니어를 목표로
          합니다.
        </p>
      </div>
    </div>
  )
}

function TechStackTab() {
  return (
    <div>
      <SectionTitle>기술 스택</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {TECH_STACK.map((tech) => (
          <span
            key={tech}
            className="rounded-pill border border-border bg-card px-3 py-1 text-body-sm text-foreground"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  )
}

function CareerTab() {
  return (
    <div>
      <SectionTitle>경력</SectionTitle>
      <div className="flex flex-col gap-8">
        {CAREERS.map((career) => (
          <div key={career.company + career.period} className="border-b border-border pb-8 last:border-0 last:pb-0">
            <p className="m-0 text-title text-foreground">{career.company}</p>
            <p className="m-0 mb-3 text-body-sm text-muted-foreground">{career.role}</p>
            <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-body-sm text-foreground">
              {career.duties.map((duty) => (
                <li key={duty}>{duty}</li>
              ))}
            </ul>
            <p className="m-0 mt-3 text-caption text-muted-foreground">
              {career.period} ({career.duration})
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProjectsTab() {
  return (
    <div>
      <SectionTitle>프로젝트</SectionTitle>
      <div className="flex flex-col gap-10">
        {PROJECTS.map((project) => (
          <div
            key={project.org + project.name}
            className="border-b border-border pb-10 last:border-0 last:pb-0"
          >
            <p className="m-0 text-caption text-notion-blue uppercase">{project.org}</p>
            <p className="m-0 mb-2 text-title text-foreground">{project.name}</p>
            <p className="m-0 mb-3 text-body-sm text-muted-foreground">{project.description}</p>
            <ul className="m-0 mb-3 flex list-disc flex-col gap-1 pl-5 text-body-sm text-foreground">
              {project.contributions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="m-0 mb-1 text-caption text-muted-foreground">🛠 {project.stack}</p>
            {project.links && (
              <div className="mb-1 flex flex-wrap gap-3 text-body-sm">
                {project.links.map((link) => (
                  <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                    🔗 {link.label}
                  </a>
                ))}
              </div>
            )}
            <p className="m-0 text-caption text-muted-foreground">{project.period}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PortfolioTab() {
  return (
    <div>
      <SectionTitle>포트폴리오</SectionTitle>
      <ul className="m-0 flex list-none flex-col gap-2 p-0 text-body-sm">
        {PORTFOLIO_LINKS.map((link) => (
          <li key={link.href}>
            <span className="mr-2 text-muted-foreground">{link.label}</span>
            <a href={link.href} target="_blank" rel="noreferrer">
              {link.href}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EducationTab() {
  return (
    <div>
      <SectionTitle>교육</SectionTitle>
      <div className="flex flex-col gap-6">
        {EDUCATIONS.map((edu) => (
          <div key={edu.org}>
            <p className="m-0 text-title text-foreground">{edu.org}</p>
            <p className="m-0 text-body-sm text-muted-foreground">{edu.type}</p>
            <p className="m-0 text-caption text-muted-foreground">
              {edu.period} · {edu.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CertificatesTab() {
  return (
    <div>
      <SectionTitle>자격증</SectionTitle>
      <div className="flex flex-col gap-4">
        {CERTIFICATES.map((cert) => (
          <div key={cert.name}>
            <p className="m-0 text-title text-foreground">{cert.name}</p>
            <p className="m-0 text-caption text-muted-foreground">
              {cert.score} · {cert.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Resume() {
  // 스크롤 스파이: 지금 화면에 보이는 섹션을 감지해서 네비게이션에 활성 표시
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: "-120px 0px -70% 0px", threshold: 0 },
    )
    for (const { id } of SECTIONS) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <main className="mx-auto w-[984px] pt-8">
      <nav
        className="sticky z-10 flex gap-6 overflow-x-auto rounded-t-xl border-border border-b bg-card px-[74px] pt-3"
        style={{ top: "var(--header-height)" }}
      >
        {SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={cn(
              "shrink-0 border-b-[1.6px] px-1 py-3 text-body-sm no-underline",
              section.id === activeId
                ? "border-notion-blue font-bold text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {section.label}
          </a>
        ))}
      </nav>

      <div className="rounded-b-xl bg-card px-[74px] pt-6 pb-[74px]">
        {SECTIONS.map(({ id, Component }, index) => (
          <section
            key={id}
            id={id}
            className={cn(
              "scroll-mt-[calc(var(--header-height)+3.5rem)]",
              index > 0 && "mt-14",
            )}
          >
            <Component />
          </section>
        ))}
      </div>
    </main>
  )
}
