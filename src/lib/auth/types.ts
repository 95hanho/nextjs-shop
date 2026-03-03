// 토큰 재발급 결과
export type AutoRefreshResult =
	| {
			ok: true;
			userNo?: number;
			newAccessToken?: string;
			newRefreshToken?: string;
			isAnonymous?: boolean; // ✅ 추가
			reason?: "NO_TOKENS" | "NO_REFRESH"; // ✅ 추가
	  }
	| {
			ok: false;
			status: number;
			message: string;
			clearCookies?: boolean;
	  };
