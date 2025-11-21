import API_URL from "@/api/endpoints";
import { postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

/*  */
// 판매자 추가
export const POST = withAuth(async ({ nextRequest }) => {
	try {
		// method별 요청처리
		if (nextRequest.method === "POST") {
			const { sellerId, password, businessRegistrationNumber, extensionNumber, mobileNumber, email } = await nextRequest.json();
			if (!sellerId) return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });
			if (!password) return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });
			if (!businessRegistrationNumber) return NextResponse.json({ message: "사업자등록번호를 입력해주세요." }, { status: 400 });
			if (!extensionNumber) return NextResponse.json({ message: "내선 전화번호를 입력해주세요." }, { status: 400 });
			if (!mobileNumber) return NextResponse.json({ message: "휴대폰번호를 입력해주세요." }, { status: 400 });
			if (!email) return NextResponse.json({ message: "이메일를 입력해주세요." }, { status: 400 });

			const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.ADMIN_ADD_SELLER), {
				sellerId,
				password,
				businessRegistrationNumber,
				extensionNumber,
				mobileNumber,
				email,
			});
			console.log("data", data);

			return NextResponse.json({ message: data.message }, { status: 200 });
		}
		return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
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
