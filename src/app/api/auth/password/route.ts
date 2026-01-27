import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { isProd, WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { generatePwdResetToken, verifyPhoneAuthCompleteToken, verifyPwdResetToken, verifyRefreshToken, verifyToken } from "@/lib/jwt";
import { PWD_CHANGE_COOKIE_AGE } from "@/lib/tokenTime";
import { BaseResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

// 비밀번호 변경 토큰 생성
export const POST = withAuth(async ({ userId }) => {
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
		// 토큰삭제
		response.cookies.set("phoneAuthCompleteToken", "", {
			httpOnly: true,
			secure: isProd,
			sameSite: "strict",
			path: "/",
			maxAge: 0,
		});

		return response;
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});

// 비밀번호 변경
export const PUT = async (nextRequest: NextRequest) => {
	try {
		let pwdResetToken;
		try {
			pwdResetToken = nextRequest.cookies.get("pwdResetToken")?.value || nextRequest.headers.get("pwdResetToken") || undefined;
			if (!pwdResetToken?.trim()) throw new Error("NO_PWDRESET_TOKEN");
			verifyPwdResetToken(pwdResetToken);
			//
			const phoneAuthCompleteToken =
				nextRequest.cookies.get("phoneAuthCompleteToken")?.value || nextRequest.headers.get("phoneAuthCompleteToken") || undefined;
			const refreshToken = nextRequest.cookies.get("refreshToken")?.value || nextRequest.headers.get("refreshToken") || undefined;
			// 비밀번호 찾기에서
			if (phoneAuthCompleteToken?.trim()) {
				verifyPhoneAuthCompleteToken(phoneAuthCompleteToken);
			}
			// 마이페이지에서
			else if (refreshToken?.trim()) {
				verifyRefreshToken(refreshToken);
			}
			// 실패
			else throw new Error("NO_TOKEN");
		} catch (err) {
			return NextResponse.json(
				{
					status: 401,
					message: "PWDRESET_UNAUTHORIZED",
				},
				{ status: 401 },
			);
		}

		const { curPassword, newPassword } = await nextRequest.json();
		if (!newPassword) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: { curPassword?: string; newPassword: string; pwdResetToken: string } = { newPassword, pwdResetToken };
		if (curPassword) payload.curPassword = curPassword;

		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.AUTH_PASSWORD), payload);
		console.log("data", data);

		// 사용한 토큰 제거
		const response = NextResponse.json({ message: data.message }, { status: 200 });
		response.cookies.set("phoneAuthCompleteToken", "", {
			httpOnly: true,
			secure: isProd,
			sameSite: "strict",
			path: "/",
			maxAge: 0,
		});

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
};
