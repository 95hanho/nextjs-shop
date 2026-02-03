import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData, putUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { isProd } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { verifyPhoneAuthCompleteToken } from "@/lib/jwt";
import { JoinRequest, UserUpdateRequest } from "@/types/auth";
import { BaseResponse, ISODate } from "@/types/common";
import { parseISODate } from "@/utils/date";
import { NextRequest, NextResponse } from "next/server";

type JoinPayloadForSpring = Omit<JoinRequest, "birthday"> & {
	birthday: ISODate;
};

// 회원가입
export const POST = async (nextRequest: NextRequest) => {
	try {
		const { userId, password, name, zonecode, address, addressDetail, birthday, phone, email }: JoinRequest = await nextRequest.json();
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
				{ status: 401 },
			);
		}

		const payload: JoinPayloadForSpring = {
			userId,
			password,
			name,
			zonecode,
			address,
			addressDetail,
			birthday: parseISODate(birthday),
			phone,
			email,
		};

		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.AUTH_JOIN), {
			...payload,
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
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
};

// 회원정보변경
export const PUT = withAuth(async ({ nextRequest, accessToken }) => {
	try {
		const { zonecode, address, addressDetail, phone, changePhone, email }: UserUpdateRequest = await nextRequest.json();
		if (!phone) return NextResponse.json({ message: "핸드폰번호를 입력해주세요." }, { status: 400 });
		if (!email) return NextResponse.json({ message: "이메일을 입력해주세요." }, { status: 400 });

		if (changePhone) {
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
					{ status: 401 },
				);
			}
		}

		const payload: UserUpdateRequest = {
			zonecode,
			address,
			addressDetail,
			phone,
			email,
		};

		const data = await putUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.AUTH_JOIN),
			{
				...payload,
			},
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});

// 회원탈퇴 요청
export const DELETE = withAuth(async ({ accessToken }) => {
	try {
		const data = await putUrlFormData<BaseResponse>(getBackendUrl(API_URL.AUTH_JOIN), {
			Authorization: `Bearer ${accessToken}`,
		});
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
