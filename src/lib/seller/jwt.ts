import { SELLER_TOKEN_EXPIRES_IN } from "@/lib/tokenTime";
import { SellerToken } from "@/types/seller";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";

const SELLER_JWT_SECRET_KEY = process.env.NEXT_PUBLIC_SELLER_JWT_SECRET || "your-secret";

// sellerToken 생성
export function generateSellerToken(payload: { sellerId: string }, expiresIn?: StringValue) {
	return jwt.sign({ type: "SELLER", sellerId: payload.sellerId }, SELLER_JWT_SECRET_KEY, {
		expiresIn: expiresIn || SELLER_TOKEN_EXPIRES_IN,
		algorithm: "HS256",
	});
}
// sellerToken 토큰 복호화
export function verifySellerToken(token: string): SellerToken {
	const payload = jwt.verify(token, SELLER_JWT_SECRET_KEY, { algorithms: ["HS256"] }) as SellerToken; // 실패 시 오류 발생
	const isSeller = payload.userId && payload.type === "SELLER";
	if (!isSeller) throw new Error("INVALID_TOKEN_TYPE");
	return payload;
}
