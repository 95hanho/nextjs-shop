# Implementation

프로젝트의 주요 설계 및 구현 내용을 정리했습니다.

### SSG / ISR 기반 상품 페이지 최적화

메인 페이지, 상품 카테고리 페이지, 상품 상세 페이지는 로그인 여부와 무관하게 공통으로 제공되는 상품 데이터를 중심으로 렌더링되므로 SSG/ISR 적용 대상으로 분류했습니다.

기존에는 SSR 요청 시 쿠키/헤더의 인증 토큰을 함께 전달하여 상품 데이터와 위시 여부를 같이 조회했지만, 정적 렌더링 적용을 위해 상품 공통 데이터와 사용자별 데이터를 분리했습니다.

- 메인 페이지: 제품 슬라이드 리스트 정적 생성
- 상품 카테고리 페이지: `generateStaticParams`, `dynamicParams`, `revalidate` 적용
- 상품 상세 페이지: ISR 기반 상세 데이터 갱신
- 사용자별 위시 여부는 별도 요청으로 분리

이를 통해 상품 페이지의 초기 응답 속도와 캐싱 효율을 개선했습니다.

### Next.js API Route 기반 BFF 구조

클라이언트에서 직접 Spring Boot API를 호출하지 않고, 대부분의 사용자 요청은 Next.js API Route를 거쳐 Spring Boot API와 통신하도록 구성했습니다.

이를 통해 클라이언트에 노출되는 백엔드 API 경로를 줄이고, 인증 토큰 처리와 공통 오류 처리를 Next.js API 계층에서 일관되게 적용할 수 있도록 했습니다.

단, SSG/ISR/SSR에서 필요한 서버 렌더링 데이터는 Next.js 서버 환경에서 Spring Boot API를 직접 호출하도록 분리했습니다.

### API 요청 공통화

API 요청의 중복 코드를 줄이고 요청/응답 형식을 일관되게 관리하기 위해 `endpoints.ts`와 `fetchFilter.ts`를 기반으로 요청 함수를 공통화했습니다.

- `/api/:productId` 형태의 path parameter 자동 치환
- JSON, FormData, Multipart, URLSearchParams 요청 형식 분리
- `getNormal`, `postJson`, `postFormData`, `putJson`, `deleteNormal` 등 메서드별 요청 함수 구성
- 응답 값을 `res.json()` 기준으로 통일
- 오류 응답은 `code`, `message`, `date` 형식으로 처리
- React Query catch 또는 전역 QueryClient error handler에서 공통 에러 처리
- ISR/SSG 요청을 위한 `getCached` 분리

이를 통해 API 호출 방식의 일관성을 높이고, 인증 헤더와 요청 데이터 변환 로직의 반복을 줄였습니다.

- [API 엔드포인트 목록](../src/api/endpoints.ts)
- [API 필터](../src/api/fetchFilter.ts)

### 인증/토큰 처리 공통화

사용자, 판매자, 관리자 인증 흐름이 반복되지 않도록 인증 처리 로직을 공통화했습니다.

- 사용자/판매자/관리자별 토큰명, JWT 키, refresh URL을 preset으로 분리
- Next.js API Route에서는 `withAuth`, `refreshAuthFromTokens`를 통해 인증 확인 및 토큰 재발급 처리
- middleware에서는 페이지 접근 제한을 위한 인증 검사만 수행
- 인증 필수/선택 API를 구분하기 위한 `userWithAuth`, `userWithOptionalAuth` 분리
- `x-auth-mode: required` 헤더 기반 인증 검사 제어
- `TokenRefreshLock`을 통해 API Route 내 동일 실행 컨텍스트에서 발생하는 refresh 요청 중복 완화

초기에는 middleware에서도 토큰 재발급을 처리하려 했으나, 빌드 환경에서 병렬 요청으로 인한 중복 재발급 문제가 발생할 수 있어 middleware는 인증 검사 역할로 제한하고, 실제 토큰 재발급은 Next.js API Route 계층에서 처리하도록 분리했습니다.

이를 통해 middleware의 역할을 단순화하고, API 요청 단위에서 토큰 갱신과 쿠키 재설정을 안정적으로 처리할 수 있도록 구성했습니다.

- [API 요청용 함수](../src/lib/auth/api.ts)
- [middleware 요청용 함수](../src/lib/auth/mv.ts)
- [middleware](../src/middleware.ts)
- [withAuth 사용예시](../src/app/api/auth/route.ts)

### React Query 기반 서버 상태 관리

상품 목록, 리뷰, Q&A, 주문 내역 등 서버 데이터는 React Query를 사용해 관리했습니다.
또한 QueryClient의 queryCache, mutationCache에서 공통 에러를 처리하여 API 요청 실패 시 공통된 방식으로 대응할 수 있도록 구성했습니다.

- queryKey 기반 캐시 관리
- invalidateQueries를 통한 데이터 갱신
- useInfiniteQuery를 활용한 페이지네이션
- useMutation을 통한 등록/수정/삭제 처리

### 클라이언트 상태 관리 역할 분리

프로젝트의 상태를 성격에 따라 서버 상태, 전역 UI 상태, 도메인 전역 상태로 분리했습니다.

- TanStack Query: 상품, 리뷰, 주문 등 서버 상태 관리
- Zustand: 전역 다이얼로그 및 도메인 모달 상태 관리
- React Context / Provider: 사용자, 판매자, 관리자, 구매 페이지 전역 데이터 관리

`RootProviders`, `SellerRootProvider`, `AdminRootProvider`를 각각 사용자/판매자/관리자 영역에 배치하고, `QueryClient`의 `queryCache`, `mutationCache`에서 공통 에러 처리를 수행했습니다.

전역 모달은 최상위 layout에서 `DialogRoot`, `DomainModalRoot`를 렌더링하여 컴포넌트 위치와 관계없이 호출할 수 있도록 구성했습니다.

### stock_hold 기반 구매 페이지 재고 선점 및 쿠폰 적용 흐름

바로구매와 장바구니 구매 시 `stock_hold` 기반으로 구매 진행 중인 상품 수량을 임시 선점하도록 구성했습니다.

- 구매 페이지 진입 시 stock hold 생성
- 구매 페이지에서는 holdId를 기준으로 상품, 쿠폰, 재고 상태를 관리
- 여러 사용자가 동시에 같은 재고를 점유하지 않도록 처리
- 실시간 재고 계산에 hold 수량 반영
- 장바구니 구매 시 cartId 기반 구매 완료 후 장바구니 정리
- 오류 또는 세션 종료 시 `returnUrl` 기반 복귀 흐름 구성
- 최대 할인 쿠폰 적용 여부와 쿠폰 초기화 조건을 분리하여 장바구니/구매 페이지의 쿠폰 상태를 제어

이를 통해 결제 전 단계에서도 재고 초과 주문 가능성을 줄이는 구조를 설계했습니다.

### 공통 UI / 유틸 컴포넌트 분리

반복적으로 사용되는 이미지, 위시 버튼, 옵션 선택 UI, 페이지네이션, 툴팁 등을 공통 컴포넌트로 분리했습니다.

이를 통해 상품 목록, 상품 상세, 판매자 페이지 등 여러 화면에서 동일한 UI 패턴을 재사용하고, 화면별 중복 구현을 줄였습니다.
