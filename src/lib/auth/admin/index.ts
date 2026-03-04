import { withAuth } from "@/lib/auth/api";
import { adminWithAuthPreset } from "@/lib/auth/presets/admin";
import { AuthHandler } from "@/lib/auth/types";

// 관리자 페이지 인증 필요 API 핸들러
export const adminWithAuth = <TParams extends Record<string, string> = Record<string, never>>(handler: AuthHandler<"ADMIN", TParams>) => {
	return withAuth(handler, adminWithAuthPreset);
};
