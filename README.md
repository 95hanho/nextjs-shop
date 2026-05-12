# nextjs-shop Frontend

Next.js 기반 커머스 포트폴리오 프로젝트의 프론트엔드입니다.  
상품 목록, 상품 상세, 장바구니, 주문/결제, 쿠폰, 리뷰, 판매자 페이지 등을 구현했습니다.

## 프로젝트 개요

- 프로젝트명: nextjs-shop
- 개발 기간: 2025.03.04 ~ 2026.05.07
- 개발 인원: 개인 프로젝트
- 역할: Frontend 전체 설계 및 구현
- 배포 URL: https://nextjs-shop-henna.vercel.app/

## 연동 백엔드

본 프로젝트는 Spring Boot 기반 백엔드 API와 연동됩니다.

- Backend Repository: https://github.com/95hanho/nextjs_typescript_api
- Backend Stack: Spring Boot, MyBatis, MariaDB, JWT

## 기술 스택

- Next.js : App Router 기반 라우팅 및 SSR 구현
- React Context / Provider : 전역 모달/다이얼로그 상태 관리
- React : 컴포넌트 기반 UI 구현
- TypeScript : 타입 기반 데이터 구조 관리
- TanStack Query : 서버 상태 관리 및 캐싱
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

### SSR + CSR 혼합 상품 목록

초기 상품 목록은 SSR로 렌더링하고, 이후 추가 상품은 React Query의 Infinite Query를 사용해 CSR 방식으로 불러오도록 구현했습니다.

이를 통해 초기 진입 속도와 사용자 인터랙션을 모두 고려했습니다.

### React Query 기반 서버 상태 관리

상품 목록, 리뷰, Q&A, 주문 내역 등 서버 데이터는 React Query를 사용해 관리했습니다.

- queryKey 기반 캐시 관리
- invalidateQueries를 통한 데이터 갱신
- useInfiniteQuery를 활용한 페이지네이션
- useMutation을 통한 등록/수정/삭제 처리

### 공통 이미지 컴포넌트 SmartImage

Next.js Image 사용 시 반복되는 예외 처리를 줄이기 위해 SmartImage 컴포넌트를 구현했습니다.

- 기본 이미지 처리
- CDN / 로컬 이미지 경로 대응
- fill / fixed size 분기
- priority 옵션 제어

## 문서

- [디렉토리 구조](./docs/STRUCTURE.md)
- [코드 컨벤션](./docs/CONVENTION.md)
- [트러블슈팅](./docs/TROUBLESHOOTING.md)
- [Hydration 오류 해결](./docs/TROUBLESHOOTING.md#1-hydration-오류-해결)
- [토큰 재발급 중복 요청 문제](./docs/TROUBLESHOOTING.md#2-토큰-재발급-중복-요청-문제)
- [상품 이미지 최적화 문제](./docs/TROUBLESHOOTING.md#3-상품-이미지-최적화-문제)

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
