import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { verifyPhoneAuthCompleteToken } from "@/lib/auth/utils/token";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { SellerRegisterRequest } from "@/types/seller";
import { NextRequest, NextResponse } from "next/server";

// 판매자 등록요청(회원가입)
export const POST = async (nextRequest: NextRequest) => {
	console.log("[API] 판매자 등록요청");
	try {
		const {
			sellerId,
			password,
			sellerName,
			sellerNameEn,
			extensionNumber,
			mobileNumber,
			email,
			businessRegistrationNumber,
			telecomSalesNumber,
			representativeName,
			businessZipcode,
			businessAddress,
			businessAddressDetail,
		}: SellerRegisterRequest = await nextRequest.json();
		if (!sellerId) return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });
		if (!password) return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });
		if (!sellerName) return NextResponse.json({ message: "판매자 이름(한글)을 입력해주세요." }, { status: 400 });
		if (!mobileNumber) return NextResponse.json({ message: "대표번호를 입력해주세요." }, { status: 400 });
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

		const payload: SellerRegisterRequest = {
			sellerId,
			password,
			sellerName,
			sellerNameEn,
			extensionNumber,
			mobileNumber,
			email,
			businessRegistrationNumber,
			telecomSalesNumber,
			representativeName,
			businessZipcode,
			businessAddress,
			businessAddressDetail,
		};
		// console.log("TEST", payload);
		// return NextResponse.json({ message: "테스트용 응답입니다." }, { status: 200 });

		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.SELLER_REGISTRATION), { ...payload });
		// console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
};
