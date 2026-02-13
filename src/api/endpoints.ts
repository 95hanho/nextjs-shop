// API 엔드포인트 목록 - API url 모음집
const API_URL = {
	// 관리자 ----------------------------------
	/** 관리자 정보가져오기, 로그인 */
	ADMIN: "/admin",
	/** spring:로그인 토큰 저장 */
	ADMIN_TOKEN: "/admin/token",
	/** 로그인 토큰 수정(재저장) */
	ADMIN_TOKEN_REFRESH: "/admin/token/refresh",
	/** 판매자 조회, 판매자 추가 */
	ADMIN_SELLER: "/admin/seller",
	/** 판매자 승인여부 변경 */
	ADMIN_SELLER_APPROVAL: "/admin/seller/approval",
	/** 회원조회, 회원 정보 보기(마스킹해제) */
	ADMIN_USER: "/admin/user",
	/** 회원 탈퇴 확정하기 */
	ADMIN_USER_WITHDRAWAL: "/admin/user/withdrawal",
	/** 공용 쿠폰 조회, 공용 쿠폰 등록, 공용 쿠폰 수정 */
	ADMIN_COUPON_COMMON: "/admin/coupon/common",
	ADMIN_COUPON_COMMON_DELETE: "/admin/coupon/:couponId",

	// 인증 ----------------------------------
	/** 로그인, 유저정보가져오기 */
	AUTH: "/auth",
	/** 로그아웃 */
	AUTH_LOGOUT: "/auth/logout",
	/** 유저아이디 조회 By인증토큰, 아이디 중복확인 */
	AUTH_ID: "/auth/id",
	/** 휴대폰 인증 */
	AUTH_PHONE_AUTH: "/auth/phone",
	/** 휴대폰 인증 확인 */
	AUTH_PHONE_AUTH_CHECK: "/auth/phone/check",
	/** 회원가입, 회원정보변경, 회원탈퇴 요청 */
	AUTH_JOIN: "/auth/user",
	/** spring:로그인 토큰 저장 */
	AUTH_TOKEN: "/auth/token",
	/** 로그인 토큰 수정(재저장) */
	AUTH_TOKEN_REFRESH: "/auth/token/refresh",
	/** nextjs: r토큰확인 */
	AUTH_TOKEN_CHECK: "/auth/token-check",
	/** 패스워드 리셋토큰 확인 */
	AUTH_TOKEN_CHECK_PASSWORD: "/auth/token-check/password",
	/** 비밀번호 변경 토큰 생성, 비밀번호 변경 */
	AUTH_PASSWORD: "/auth/password",

	// 구매 ----------------------------------
	/** 상품 확인 및 점유, 구매상품 점유 해제 */
	BUY_HOLD: "/buy/stock-hold",
	/** 구매상품 점유 연장 */
	BUY_HOLD_EXTENT: "/buy/stock-hold/extend",
	/** 점유중인 상품조회, 상품구매/결제 */
	BUY_PAY: "/buy/pay",
	/** 결제 바로 전 가격계산해서 보여줌 */
	BUY_PRICE: "/buy/pay-price",

	// 메인 ----------------------------------
	/** 카테고리메뉴 */
	MAIN_MENU: "/main/menu",
	/** 메인뷰 제품조회 */
	MAIN: "/main",

	// 마이페이지 ----------------------------------
	/** 유저쿠폰 조회 */
	MY_USER_COUPON: "/mypage/user-coupon",
	/** 주문배송정보 조회 */
	MY_ORDER: "/mypage/my-order",
	/** 주문배송정보 상세조회 */
	MY_ORDER_DETAIL: "/mypage/my-order/:orderId",
	/** 리뷰 작성 */
	MY_REVIEW: "/mypage/review",
	/** 장바구니 조회, 장바구니 제품 수량 변경, 장바구니 선택여부 변경, 장바구니 제품 삭제 */
	MY_CART: "/mypage/cart",
	/** 장바구니 제품 삭제 */
	MY_CART_OPTION_PRODUCT_DETAIL: "/mypage/cart/option/product-option",
	/** 위시리스트 조회 */
	MY_WISH: "/mypage/wish",
	/** 위시리스트 삭제 */
	MY_WISH_DELETE: "/mypage/wish/:wishId",
	/** 유저배송지 조회, 유저배송지 추가/수정 */
	MY_ADDRESS: "/mypage/address",
	/** 유저배송지 삭제 */
	MY_ADDRESS_DELETE: "/mypage/address/:addressId",

	// 제품 ----------------------------------
	/** 제품리스트 조회 */
	PRODUCT: "/product",
	/** 좋아요/취소 */
	PRODUCT_LIKE: "/product/like",
	/** 위시 등록/해제 */
	PRODUCT_WISH: "/product/wish",
	/** 장바구니 넣기 */
	PRODUCT_CART: "/product/cart",
	/** 제품상세보기 조회 */
	PRODUCT_DETAIL: "/product/detail/:productId",
	/** 제품 사용가능 쿠폰 조회 */
	PRODUCT_DETAIL_COUPON: "/product/detail/:productId/coupon",
	/** 쿠폰 다운로드 */
	PRODUCT_COUPON_DOWNLOAD: "/product/coupon/download",
	/** 제품 리뷰 조회 */
	PRODUCT_DETAIL_REVIEW: "/product/detail/:productId/review",
	/** 제품 상품 Q&A 조회 */
	PRODUCT_DETAIL_QNA: "/product/detail/:productId/qna",

	// 판매자 ----------------------------------
	/** 판매자 정보조회, 로그인 */
	SELLER: "/seller",
	/** 판매자 로그인토큰 저장 */
	SELLER_TOKEN: "/seller/token",
	/** 판매자 로그인 토큰 수정(재저장) */
	SELLER_TOKEN_REFRESH: "/seller/token/refresh",
	/** 판매자 로그아웃 */
	SELLER_LOGOUT: "/seller/logout",
	/** 판매자id 중복확인 */
	SELLER_ID: "/seller/id",
	/** 판매자 등록요청(회원가입) */
	SELLER_REGISTRATION: "/seller/registration",
	/** 제품 조회, 제품추가, 제품수정 */
	SELLER_PRODUCT: "/seller/product",
	/** 제품옵션추가, 판매자제품옵션변경 */
	SELLER_PRODUCT_OPTION: "/seller/product/option",
	/** 옵션삭제 */
	SELLER_PRODUCT_OPTION_DELETE: "/seller/product/option/:productOptionId",
	/** 쿠폰조회, 쿠폰등록, 쿠폰수정 */
	SELLER_COUPON: "/seller/coupon",
	/** 쿠폰삭제 */
	SELLER_COUPON_DELETE: "/seller/coupon/:couponId",
	/** 쿠폰 상태 변경 */
	SELLER_COUPON_STATUS: "/seller/coupon/status",
	/** 쿠폰 허용제품 조회, 쿠폰 허용제품 변경 */
	SELLER_COUPON_ALLOWED: "/seller/coupon/allowed",
	/** 해당 쿠폰을 유저에게 발행하기 */
	SELLER_COUPON_USER_COUPON: "/seller/coupon/user-coupon",
	/** 판매자와 관련된 회원 조회 */
	SELLER_INTERESTING_USER: "/seller/user/interesting",
};

export default API_URL;
