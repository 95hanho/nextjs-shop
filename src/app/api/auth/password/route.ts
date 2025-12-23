import API_URL from "@/api/endpoints";
import { postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { isProd } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { generatePwdResetToken, verifyPwdResetToken } from "@/lib/jwt";
import { PWD_CHANGE_COOKIE_AGE } from "@/lib/tokenTime";
import { BaseResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

// 비밀번호 변경 토큰 생성
export const POST = withAuth(async ({ userId, params }) => {
	try {
		const response = NextResponse.json({ message: "MAKE_PWDRESET_TOKEN" }, { status: 200 });
		const pwdResetToken = generatePwdResetToken({ userId });
		response.cookies.set("pwdResetToken", pwdResetToken, {
			httpOnly: true,
			secure: isProd,
			sameSite: "strict",
			path: "/",
			maxAge: PWD_CHANGE_COOKIE_AGE,
		});
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
});

// 비밀번호 변경
export const PUT = async (nextRequest: NextRequest) => {
	try {
		let pwdResetToken;
		try {
			pwdResetToken = nextRequest.cookies.get("pwdResetToken")?.value || nextRequest.headers.get("pwdResetToken") || undefined;
			if (!pwdResetToken) throw new Error("NO_PWDRESET_TOKEN");
			verifyPwdResetToken(pwdResetToken);
		} catch (err) {
			return NextResponse.json(
				{
					status: 401,
					message: "PWDRESET_UNAUTHORIZED",
				},
				{ status: 401 }
			);
		}

		const { curPassword, newPassword } = await nextRequest.json();
		if (!newPassword) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		const payload: { curPassword?: string; newPassword: string; pwdResetToken: string } = { newPassword, pwdResetToken };
		if (curPassword) payload.curPassword = curPassword;

		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.AUTH_PASSWORD), payload);
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
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
};
