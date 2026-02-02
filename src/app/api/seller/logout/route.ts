import { toErrorResponse } from "@/api/error";
import { isProd } from "@/lib/env";
import { NextResponse } from "next/server";

// 로그아웃
export const POST = () => {
	try {
		const response = NextResponse.json({ message: "SELLER_LOGOUT_SUCCESS" }, { status: 200 });
		// 토큰 초기화
		response.headers.set(
			"Set-Cookie",
			[
				`sellerToken=; Path=/; Max-Age=0; HttpOnly; ${isProd ? "Secure; " : ""}SameSite=Strict`,
				`sellerRefreshToken=; Path=/; Max-Age=0; HttpOnly; ${isProd ? "Secure; " : ""}SameSite=Strict`,
			].join(", "),
		);

		return response;
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
};
