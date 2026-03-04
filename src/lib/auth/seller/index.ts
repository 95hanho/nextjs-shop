import { withAuth } from "@/lib/auth/api";
import { sellerWithAuthPreset } from "@/lib/auth/presets/seller";
import { AuthHandler } from "@/lib/auth/types";

// 판매자 페이지 인증 필요 API 핸들러
export const withSellerAuth = <TParams extends Record<string, string> = Record<string, never>>(handler: AuthHandler<"SELLER", TParams>) => {
	return withAuth(handler, sellerWithAuthPreset);
};
