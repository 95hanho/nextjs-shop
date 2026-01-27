import { SELLER_JWT_SECRET_KEY } from "@/lib/env";
import { SELLER_TOKEN_EXPIRES_IN } from "@/lib/tokenTime";
import { Token } from "@/types/token";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

// sellerToken 생성
export function generateSellerToken(payload: { sellerNo: number }, expiresIn?: StringValue) {
	return jwt.sign({ type: "SELLER", sellerNo: payload.sellerNo }, SELLER_JWT_SECRET_KEY, {
		expiresIn: expiresIn || SELLER_TOKEN_EXPIRES_IN,
		algorithm: "HS256",
	});
}
// sellerToken 토큰 복호화
export function verifySellerToken(token: string): Token {
	const payload = jwt.verify(token, SELLER_JWT_SECRET_KEY, { algorithms: ["HS256"] }) as Token; // 실패 시 오류 발생
	const isSeller = payload.sellerNo && payload.type === "SELLER";
	if (!isSeller) throw new Error("INVALID_TOKEN_TYPE");
	return payload;
}
