# nextjs-shop Frontend

Next.js 기반 커머스 포트폴리오 프로젝트의 프론트엔드입니다.  
상품 목록, 상품 상세, 장바구니, 주문/결제, 쿠폰, 리뷰, 판매자 페이지 등을 구현했습니다.

## 프로젝트 개요

- 프로젝트명: nextjs-shop
- 개발 기간: 2025.03.04 ~ 2026.05.07
- 개발 인원: 개인 프로젝트
- 역할: Frontend 전체 설계 및 구현
- 배포 URL: https://nextjs-shop-henna.vercel.app/

## 테스트 안내

배포된 서비스에서 아래 테스트 계정으로 주요 기능을 확인할 수 있습니다.

| 구분        | 아이디   | 비밀번호  |
| ----------- | -------- | --------- |
| 일반 사용자 | test     | aaaaaa1!  |
| 판매자      | seller11 | a123159!! |

### 테스트 추천 경로

- 카테고리: 상의 > 반소매 티셔츠

해당 카테고리에 상품 목록, 정렬, 무한스크롤, 상품 상세, 장바구니 테스트용 데이터가 가장 많이 등록되어 있습니다.

## 연동 백엔드

본 프로젝트는 Spring Boot 기반 백엔드 API와 연동됩니다.

- Backend Repository: https://github.com/95hanho/nextjs_typescript_api
- Backend Stack: Spring Boot, MyBatis, MariaDB, JWT

## 기술 스택

- Next.js : App Router 기반 라우팅 및 SSR 구현
- React : 컴포넌트 기반 UI 구현
- TypeScript : 타입 기반 데이터 구조 관리
- TanStack Query : 서버 상태 관리 및 캐싱
- Zustand : 전역 모달/다이얼로그 상태 관리
- React Context / Provider : 사용자/판매자/관리자 전역 데이터 및 구매 페이지 상태 관리
- SCSS Module : 컴포넌트 단위 스타일 관리
- Swiper : 상품 이미지 슬라이더 구현
- Vercel / Cafe24 : 프론트엔드 및 백엔드 배포

## 주요 기능

### 사용자

- 상품 목록 조회
- 상품 상세 조회
- 옵션 선택
- 장바구니
- 주문/결제
- 쿠폰 적용
- 리뷰 작성/수정/삭제
- 상품 Q&A

### 판매자

- 판매자 로그인
- 상품 관리
- 주문 관리
- 쿠폰 관리

## 주요 구현 포인트

프로젝트의 주요 설계 및 구현 내용은 [주요 구현 포인트 문서](./docs/IMPLEMENTATION.md)에 정리했습니다.

- SSG / ISR 기반 상품 페이지 최적화
- Next.js API Route 기반 BFF 구조
- API 요청 공통화
- 인증/토큰 처리 공통화
- React Query 기반 서버 상태 관리
- 클라이언트 상태 관리 역할 분리
- stock_hold 기반 구매 페이지 재고 선점 및 쿠폰 적용 흐름

## 주요 트러블슈팅

프로젝트를 진행하며 발생한 주요 문제와 해결 과정은 [트러블슈팅 문서](./docs/TROUBLESHOOTING.md)에 정리했습니다.

- SSR 페이지를 SSG/ISR로 전환하며 사용자별 데이터 분리
- 빌드 환경에서 middleware 토큰 재발급 중복 요청 문제
- API 요청 방식 중복과 오류 처리 표준화
- 공통 다이얼로그와 도메인 모달 상태 분리
- 장바구니 쿠폰 적용 상태 초기화 문제
- 구매 진행 중 재고 선점 문제

## 문서

- [디렉토리 구조](./docs/STRUCTURE.md)
- [주요 구현 포인트](./docs/IMPLEMENTATION.md)
- [코드 컨벤션](./docs/CONVENTION.md)
- [트러블슈팅](./docs/TROUBLESHOOTING.md)

## 실행 방법

```bash
npm install
npm run dev
```

## 빌드 방법

```bash
npm run build
npm run start
```
