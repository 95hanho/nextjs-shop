# Directory Structure

## 디렉토리 구조

프로젝트는 역할별로 폴더를 분리하여 API 요청, 서버 상태 관리, 전역 Provider, 인증 유틸, 타입 정의를 독립적으로 관리할 수 있도록 구성했습니다.

```bash
NEXTJS-SHOP
├─ docs              # 프로젝트 문서
├─ public            # 정적 파일 및 이미지
├─ src
│  ├─ api            # API 요청 함수 및 endpoint 관리
│  ├─ app            # Next.js App Router 페이지 구성
│  ├─ assets         # 프로젝트 내부 이미지/스타일 리소스
│  ├─ components     # 공통 UI 컴포넌트
│  ├─ hooks          # custom hook 및 React Query hook 관리
│  ├─ lib            # 인증, 환경변수, 공통 유틸 함수 관리
│  ├─ providers      # 전역 Provider 구성
│  ├─ store          # 모달/다이얼로그 등 클라이언트 UI 상태 관련 코드
│  ├─ styles         # 전역 스타일 및 폰트
│  ├─ types          # TypeScript 타입 정의
│  └─ utils          # 공통 유틸 함수(범용 도구들-날짜 포맷터, 숫자 포맷터, 문자열 변환 등)
├─ middleware.ts     # 인증/라우팅 middleware
├─ next.config.mjs   # Next.js 설정
└─ package.json
```

### hooks

`hooks` 폴더는 역할에 따라 `context`, `form`, `query`로 분리했습니다.

- `context` : Provider에서 관리하는 전역 데이터를 사용하기 위한 custom hook
- `form` : 회원가입, 로그인, 정보 수정 등 길어진 form 상태와 handler 로직 분리
- `query` : TanStack Query 기반 API 요청 hook 관리

이를 통해 컴포넌트 내부에 form 상태, API 요청, 전역 상태 접근 로직이 과도하게 섞이지 않도록 구성했습니다.

### lib

`lib` 폴더에는 인증 처리, 환경변수 관리, 공통 유틸 함수를 배치했습니다.

- `auth` : 사용자/판매자/관리자 인증 처리, 토큰 확인, 토큰 재발급 관련 로직
- `env.*.ts` : 환경변수 값을 클라이언트/서버 환경에 맞게 분리하여 사용
- `getBaseUrl.ts` : 실행 환경에 따른 API base URL 처리
- `format.ts`, `price.ts`, `image.ts` : 화면 출력에 필요한 공통 포맷 유틸

특히 인증 관련 로직은 middleware와 API 요청 함수에서 함께 사용되기 때문에 `lib/auth`로 분리했습니다.

### providers

`providers` 폴더에는 서비스 전역에서 필요한 데이터와 환경을 관리하는 Provider를 배치했습니다.

- `auth` : 사용자 인증 상태 및 전역 인증 side effect 관리
- `admin` : 관리자 영역에서 필요한 전역 데이터 관리
- `seller` : 판매자 영역에서 필요한 전역 데이터 관리
- `buy` : 구매 페이지에서 사용하는 주문/결제 관련 데이터 관리

서버에서 받아오는 데이터는 TanStack Query로 관리하고, 전역으로 공유해야 하는 클라이언트 상태는 역할에 따라 분리했습니다.

- Zustand : 공통 다이얼로그, 도메인 모달 등 UI 상태 관리
- Provider : 사용자/판매자/관리자 전역 데이터 및 구매 페이지 상태 관리
