import { isProd } from "@/lib/env";
import { NextResponse } from "next/server";

// 로그아웃
export async function POST() {
	try {
		const response = NextResponse.json({ message: "SELLER_LOGOUT_SUCCESS" }, { status: 200 });
		// 토큰 초기화
		response.headers.set(
			"Set-Cookie",
			[
				`sellerToken=; Path=/; Max-Age=0; HttpOnly; ${isProd ? "Secure; " : ""}SameSite=Strict`,
				`sellerRefreshToken=; Path=/; Max-Age=0; HttpOnly; ${isProd ? "Secure; " : ""}SameSite=Strict`,
			].join(", ")
		);

		return response;
	} catch (err: any) {
		console.error("error :", {
			message: err.message,
			status: err.status,
			data: err.data,
		});

		const status = Number.isInteger(err?.status) ? err.status : 500;
		const payload = err?.data && typeof err.data === "object" ? err.data : { message: err?.message || "SERVER_ERROR" };

		return NextResponse.json(payload, { status });
	}
}
