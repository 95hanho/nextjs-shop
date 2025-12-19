// API 엔드포인트 목록 - API url 모음집
const API_URL = {
	// 관리자 ----------------------------------
	/** 판매자 추가 */
	ADMIN_ADD_SELLER: "/admin/seller",

	// 인증 ----------------------------------
	/** 로그인, 유저정보가져오기 */
	AUTH: "/auth",
	/** 로그아웃 */
	AUTH_LOGOUT: "/auth/logout",
	/** 아이디중복체크 */
	AUTH_ID: "/auth/id",
	/** 휴대폰 인증 */
	AUTH_PHONE_AUTH: "/auth/phone",
	/** 휴대폰 인증 확인 */
	AUTH_PHONE_AUTH_CHECK: "/auth/phone/check",
	/** 회원가입, 회원정보변경 */
	AUTH_JOIN: "/auth/user",
	/** nextjs: r토큰확인, spring:로그인 토큰 저장, 로그인 토큰 수정(재저장) */
	AUTH_TOKEN: "/auth/token-check",
	/** 패스워드 리셋토큰 확인 */
	AUTH_TOKEN_PASSWORD: "/auth/token-check/password",

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
	MY_CART_OPTION_PRODUCT_DETAIL: "/mypage/cart/option/product-detail",
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
	PRODUCT_DETAIL: "/product/:productId",

	// 판매자 ----------------------------------
	/** 판매자 제품 조회, 판매자제품추가/수정 */
	SELLER_PRODUCT: "/seller/product",
	/** 판매자제품상세추가, 판매자제품상세변경 */
	SELLER_PRODUCT_DETAIL: "/seller/product/detail",
	/** 판매자쿠폰조회, 판매자쿠폰등록 */
	SELLER_COUPON: "/seller/coupon",
	/** 판매자 쿠폰 상태 변경 */
	SELLER_COUPON_STATUS: "/seller/coupon/status",
	/** 판매자 해당 쿠폰 허용제품 조회, 판매자 해당 쿠폰 허용제품 변경 */
	SELLER_COUPON_ALLOWED: "/seller/coupon/allowed",
	/** 해당 쿠폰을 유저에게 발행하기 */
	SELLER_COUPON_USER_COUPON: "/seller/coupon/user-coupon",
	/** 판매자와 관련된 회원 조회 */
	SELLER_INTERESTING_USER: "/seller/user/interesting",
};

export default API_URL;
