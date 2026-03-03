import jwt from "jsonwebtoken";
import { jwtVerify, SignJWT } from "jose";
import { TextEncoder } from "util";
import ms from "ms";
import type { StringValue } from "ms";
import { Token } from "@/types/token";

/* ===== 제네릭 헬퍼 함수 ===== */

/** JWT 생성 (Node.js 환경) */
export const generateToken = (secret: string, payload: object, expiresIn: StringValue) => {
	return jwt.sign(payload, secret, { expiresIn, algorithm: "HS256" });
};

//* JWT 생성 (Middleware Edge Runtime) */
export const generateTokenForMiddleware = (secret: string | Uint8Array, payload: object, expiresIn: StringValue) => {
	const secretAsUint8Array = typeof secret === "string" ? new TextEncoder().encode(secret) : secret;
	const expiresInMs = typeof expiresIn === "string" ? ms(expiresIn) : expiresIn;
	const expiresAt = Math.floor(Date.now() / 1000) + Math.floor(expiresInMs / 1000);

	return new SignJWT(payload as Record<string, unknown>).setProtectedHeader({ alg: "HS256" }).setExpirationTime(expiresAt).sign(secretAsUint8Array);
};

/** JWT 검증 (Node.js 환경) */
export const verifyTokenByType = (secret: string, token: string, expectedType: string, hasUserNo = false): Token => {
	const payload = jwt.verify(token, secret, { algorithms: ["HS256"] }) as Token;

	// 타입과 userNo 조건 검증
	const isValid = payload.type === expectedType && (!hasUserNo ? !payload.userNo : !!payload.userNo);
	if (!isValid) throw new Error("INVALID_TOKEN_TYPE");

	return payload;
};

/** JWT 검증 (Middleware Edge Runtime) */
export const middlewareVerifyTokenByType = async (
	secret: string | Uint8Array,
	token: string,
	expectedType: string,
	hasUserNo = false,
): Promise<Token> => {
	try {
		const secretAsUint8Array = typeof secret === "string" ? new TextEncoder().encode(secret) : secret;
		const { payload } = await jwtVerify(token, secretAsUint8Array, { algorithms: ["HS256"] });

		const isValid = payload.type === expectedType && (!hasUserNo ? !payload.userNo : !!payload.userNo);
		if (!isValid) throw new Error("INVALID_TOKEN_TYPE");

		return payload as Token;
	} catch (err) {
		console.error("Token verify failed", err);
		throw err;
	}
};
