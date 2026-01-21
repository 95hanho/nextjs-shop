import { ADMIN_TOKEN_EXPIRES_IN } from "@/lib/tokenTime";
import { AdminToken } from "@/types/admin";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

const ADMIN_JWT_SECRET_KEY = process.env.NEXT_PUBLIC_ADMIN_JWT_SECRET || "your-secret";

// adminToken 생성
export function generateAdminToken(payload: { adminNo: number }, expiresIn?: StringValue) {
	return jwt.sign({ type: "ADMIN", adminNo: payload.adminNo }, ADMIN_JWT_SECRET_KEY, {
		expiresIn: expiresIn || ADMIN_TOKEN_EXPIRES_IN,
		algorithm: "HS256",
	});
}
// adminToken 토큰 복호화
export function verifyAdminToken(token: string): AdminToken {
	const payload = jwt.verify(token, ADMIN_JWT_SECRET_KEY, { algorithms: ["HS256"] }) as AdminToken; // 실패 시 오류 발생
	const isAdmin = payload.adminNo && payload.type === "ADMIN";
	if (!isAdmin) throw new Error("INVALID_TOKEN_TYPE");
	return payload;
}
