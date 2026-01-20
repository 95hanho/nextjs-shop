import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { SellerRegisterRequest } from "@/types/seller";
import { NextRequest, NextResponse } from "next/server";

// 판매자 등록요청(회원가입)
export const POST = async (nextRequest: NextRequest) => {
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
		if (!sellerNameEn) return NextResponse.json({ message: "판매자 이름(영어)을 입력해주세요." }, { status: 400 });
		if (!extensionNumber) return NextResponse.json({ message: "내선번호를 입력해주세요." }, { status: 400 });
		if (!mobileNumber) return NextResponse.json({ message: "대표번호를 입력해주세요." }, { status: 400 });
		if (!email) return NextResponse.json({ message: "이메일을 입력해주세요." }, { status: 400 });
		if (!businessRegistrationNumber) return NextResponse.json({ message: "사업자등록번호를 입력해주세요." }, { status: 400 });
		if (!telecomSalesNumber) return NextResponse.json({ message: "통신 판매자 번호를 입력해주세요." }, { status: 400 });
		if (!representativeName) return NextResponse.json({ message: "대표자 이름를 입력해주세요." }, { status: 400 });
		if (!businessZipcode) return NextResponse.json({ message: "사업장 소재지 우편번호를 입력해주세요." }, { status: 400 });
		if (!businessAddress) return NextResponse.json({ message: "사업장 소재지 주소를 입력해주세요." }, { status: 400 });
		if (!businessAddressDetail) return NextResponse.json({ message: "사업장 소재지 상세주소를 입력해주세요." }, { status: 400 });

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
		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.SELLER_REGISTRATION), { ...payload });
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
};
