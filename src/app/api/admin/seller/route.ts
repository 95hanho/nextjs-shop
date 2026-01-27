import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { withAdminAuth } from "@/lib/admin/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { AddSellerRequest } from "@/types/admin";
import { BaseResponse } from "@/types/common";
import { NextResponse } from "next/server";

/*  */
// 판매자 조회
export const GET = withAdminAuth(async ({ adminToken }) => {
	try {
		const data = await getNormal<BaseResponse>(getBackendUrl(API_URL.ADMIN_SELLER), undefined, {
			Authorization: `Bearer ${adminToken}`,
		});
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 판매자 추가
export const POST = withAdminAuth(async ({ nextRequest, adminToken }) => {
	try {
		// method별 요청처리
		if (nextRequest.method === "POST") {
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
			} = await nextRequest.json();
			if (!sellerId) return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });
			if (!password) return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });
			if (!sellerName) return NextResponse.json({ message: "판매자 이름(한글)을 입력해주세요." }, { status: 400 });
			if (!sellerNameEn) return NextResponse.json({ message: " 판매자 이름(영어)을 입력해주세요." }, { status: 400 });
			if (!extensionNumber) return NextResponse.json({ message: "내선 전화번호를 입력해주세요." }, { status: 400 });
			if (!mobileNumber) return NextResponse.json({ message: "휴대폰번호를 입력해주세요." }, { status: 400 });
			if (!email) return NextResponse.json({ message: "이메일를 입력해주세요." }, { status: 400 });
			if (!businessRegistrationNumber) return NextResponse.json({ message: "사업자등록번호를 입력해주세요." }, { status: 400 });
			if (!telecomSalesNumber) return NextResponse.json({ message: "통신 판매자 번호를 입력해주세요." }, { status: 400 });
			if (!representativeName) return NextResponse.json({ message: "대표자 이름를 입력해주세요." }, { status: 400 });
			if (!businessZipcode) return NextResponse.json({ message: "사업장 소재지 우편번호를 입력해주세요." }, { status: 400 });
			if (!businessAddress) return NextResponse.json({ message: "사업장 소재지 주소를 입력해주세요." }, { status: 400 });
			if (!businessAddressDetail) return NextResponse.json({ message: "사업장 소재지 상세주소를 입력해주세요." }, { status: 400 });

			const payload: AddSellerRequest = {
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

			const data = await postUrlFormData<BaseResponse>(
				getBackendUrl(API_URL.ADMIN_SELLER),
				{ ...payload },
				{
					Authorization: `Bearer ${adminToken}`,
				},
			);
			console.log("data", data);

			return NextResponse.json({ message: data.message }, { status: 200 });
		}
		return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
