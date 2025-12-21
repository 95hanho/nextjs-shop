import API_URL from "@/api/endpoints";
import { postUrlFormData } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { verifyToken } from "@/lib/jwt";
import { BaseResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

// 휴대폰 인증 확인
export async function POST(nextRequest: NextRequest) {
	try {
		const { userId, phoneAuthToken, authNumber } = await nextRequest.json();

		try {
			const tokenData = verifyToken(phoneAuthToken);
			if (tokenData.userId !== userId) {
				throw new Error("NOT_EQUAL_ID");
			}
		} catch (err) {
			return NextResponse.json(
				{
					status: 401,
					message: "PHONEAUTH_TOKEN_UNAUTHORIZED",
				},
				{ status: 401 }
			);
		}

		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.AUTH_PHONE_AUTH_CHECK), { authNumber, phoneAuthToken });

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
