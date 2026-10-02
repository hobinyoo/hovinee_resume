---
name: web-accessibility
description: 웹 접근성(KWCAG 2.2) 적용. 탭/드롭다운/모달/메뉴 등 인터랙티브 컴포넌트, 폼, 동적 메시지를 작성할 때 사용.
---

# 웹 접근성 (KWCAG 2.2 / WAI-ARIA)

웹 애플리케이션(컴포넌트 단위)에 적용되는 부분을 다룬다.

## 공통 원칙
- **키보드만으로 모든 조작 가능**해야 한다(Tab/Shift+Tab/Enter/Space/Esc/방향키).
- 마우스 hover에만 의존하는 인터랙션 금지.
- 포커스가 보이게(`:focus-visible` 스타일 유지).
- 이미지 `alt`, 아이콘 버튼 `aria-label`.
- 색상만으로 정보를 전달하지 않기(명도 대비 4.5:1 이상).

## 컴포넌트별 핵심

| 컴포넌트 | 필수 처리 |
|----------|-----------|
| 모달/다이얼로그 | `role="dialog"` `aria-modal` , 포커스 트랩, Esc 닫기, 열기 전 포커스 복원 |
| 탭 | `role="tablist/tab/tabpanel"` , 방향키 이동, `aria-selected` |
| 드롭다운/메뉴 | `role="menu/menuitem"` , 방향키, Esc, `aria-expanded` |
| 아코디언 | 버튼 `aria-expanded` + `aria-controls` |
| 슬라이더 | `role="slider"` `aria-valuemin/max/now` , 방향키 |
| 토스트/동적 메시지 | `role="status"`(폴라이트) 또는 `role="alert"`(즉시) |

## 폼
- 모든 입력에 `<label htmlFor>` 연결(또는 `aria-label`).
- 에러는 `aria-invalid` + `aria-describedby`로 메시지 연결.
- 필수 항목 `aria-required`.

## 페이지 기본
- `<html lang="ko">`, 의미 있는 `<title>`.
- 랜드마크(`header/nav/main/footer`)와 하나의 `<h1>`, 논리적 heading 순서.

## 체크리스트
- [ ] 키보드로 전 기능 조작 가능
- [ ] 포커스 표시 유지 + 모달 포커스 트랩/복원
- [ ] 인터랙티브 요소에 적절한 role/aria-*
- [ ] 폼 label·에러 aria 연결
- [ ] 동적 메시지 live region
