const authRequiredPaths = ["/mypage"]; // 로그인 필요한 경로들

//
/**
 * 로그인 필요한 경로인지 확인
 * @param pathname routePath
 * @returns boolean
 */
export const isAuthRequiredPath = (pathname: string) => {
	return authRequiredPaths.some((v) => pathname.startsWith(v));
};
