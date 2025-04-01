// API 엔드포인트 목록 - API url 모음집
const API_URL = {
	MEMBER: "/auth", // 로그인, 유저정보가져오기
	MEMBER_ID: "/auth/id", // 아이디중복체크
	MEMBER_JOIN: "/auth/member", // 회원가입
	MEMBER_TOKEN: "/auth/token", // 토큰리프레시
};

export default API_URL;
