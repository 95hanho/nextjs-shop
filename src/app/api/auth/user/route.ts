import API_URL from "@/api/endpoints";
import { postUrlFormData, putUrlFormData } from "@/api/fetchFilter";
import { isProd } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { verifyPhoneAuthCompleteToken } from "@/lib/jwt";
import { JoinForm } from "@/types/auth";
import { BaseResponse } from "@/types/common";
import { verify } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// 회원가입
export async function POST(nextRequest: NextRequest) {
	try {
		const { userId, password, name, zonecode, address, addressDetail, birthday, phone, email }: JoinForm = await nextRequest.json();
		if (!userId) return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });
		if (!password) return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });
		if (!name) return NextResponse.json({ message: "이름을 입력해주세요." }, { status: 400 });
		if (!zonecode) return NextResponse.json({ message: "우편번호를 입력해주세요." }, { status: 400 });
		if (!address) return NextResponse.json({ message: "주소를 입력해주세요." }, { status: 400 });
		if (!addressDetail) return NextResponse.json({ message: "상세주소를 입력해주세요." }, { status: 400 });
		if (!birthday) return NextResponse.json({ message: "생년월일을 입력해주세요." }, { status: 400 });
		if (!phone) return NextResponse.json({ message: "핸드폰번호를 입력해주세요." }, { status: 400 });
		if (!email) return NextResponse.json({ message: "이메일을 입력해주세요." }, { status: 400 });

		// 휴대폰인증완료토큰 검사
		try {
			const phoneAuthCompleteToken =
				nextRequest.cookies.get("phoneAuthCompleteToken")?.value || nextRequest.headers.get("phoneAuthCompleteToken") || undefined;
			if (!phoneAuthCompleteToken?.trim()) {
				throw new Error("NOT_EXIST_TOKEN");
			}
			verifyPhoneAuthCompleteToken(phoneAuthCompleteToken);
		} catch {
			return NextResponse.json(
				{
					status: 401,
					message: "PHONEAUTH_COMPLETE_UNAUTHORIZED",
				},
				{ status: 401 }
			);
		}

		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.AUTH_JOIN), {
			userId,
			password,
			name,
			zonecode,
			address,
			addressDetail,
			birthday,
			phone,
			email,
		});
		console.log("data", data);

		const response = NextResponse.json({ message: data.message }, { status: 200 });
		// 사용한 토큰 제거
		response.cookies.set("phoneAuthCompleteToken", "", {
			httpOnly: true,
			secure: isProd,
			sameSite: "strict",
			path: "/",
			maxAge: 0,
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
}

// 회원정보변경
export async function PUT(nextRequest: NextRequest) {
	try {
		const { userId, zonecode, address, addressDetail, birthday, phone, email }: JoinForm = await nextRequest.json();
		if (!userId) return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });
		if (!zonecode) return NextResponse.json({ message: "우편번호를 입력해주세요." }, { status: 400 });
		if (!address) return NextResponse.json({ message: "주소를 입력해주세요." }, { status: 400 });
		if (!addressDetail) return NextResponse.json({ message: "상세주소를 입력해주세요." }, { status: 400 });
		if (!birthday) return NextResponse.json({ message: "생년월일을 입력해주세요." }, { status: 400 });
		if (!phone) return NextResponse.json({ message: "핸드폰번호를 입력해주세요." }, { status: 400 });
		if (!email) return NextResponse.json({ message: "이메일을 입력해주세요." }, { status: 400 });

		const data = await putUrlFormData<BaseResponse>(getBackendUrl(API_URL.AUTH_JOIN), {
			userId,
			zonecode,
			address,
			addressDetail,
			birthday,
			phone,
			email,
		});
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
}
