import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { withSellerAuth } from "@/lib/admin/auth";
import { BaseResponse } from "@/types/common";
import { AddSellerProductRequest, GetSellerProductListResponse, UpdateSellerProductRequest } from "@/types/seller";
import { NextResponse } from "next/server";

// 판매자 제품 조회
export const GET = withSellerAuth(async ({ sellerToken }) => {
	try {
		const data = await getNormal<GetSellerProductListResponse>(getBackendUrl(API_URL.SELLER_PRODUCT), undefined, {
			Authorization: `Bearer ${sellerToken}`,
		});
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 판매자 제품 추가
export const POST = withSellerAuth(async ({ nextRequest, sellerToken }) => {
	try {
		const {
			name,
			colorName,
			price,
			menuSubId,
			materialInfo,
			manufacturerName,
			countryOfOrigin,
			washCareInfo,
			manufacturedYm,
			qualityGuaranteeInfo,
			afterServiceContact,
			afterServiceManager,
			afterServicePhone,
		}: AddSellerProductRequest = await nextRequest.json();

		if (
			!name ||
			!colorName ||
			!price ||
			!menuSubId ||
			!materialInfo ||
			!manufacturerName ||
			!countryOfOrigin ||
			!washCareInfo ||
			!manufacturedYm ||
			!qualityGuaranteeInfo ||
			!afterServiceContact
		)
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		const payload: AddSellerProductRequest = {
			name,
			colorName,
			price,
			menuSubId,
			materialInfo,
			manufacturerName,
			countryOfOrigin,
			washCareInfo,
			manufacturedYm,
			qualityGuaranteeInfo,
			afterServiceContact,
			afterServiceManager,
			afterServicePhone,
		};

		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.SELLER_PRODUCT),
			{ ...payload },
			{
				Authorization: `Bearer ${sellerToken}`,
			},
		);
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 판매자 제품 수정
export const PUT = withSellerAuth(async ({ nextRequest, sellerToken }) => {
	try {
		const {
			productId,
			name,
			colorName,
			price,
			menuSubId,
			materialInfo,
			manufacturerName,
			countryOfOrigin,
			washCareInfo,
			manufacturedYm,
			qualityGuaranteeInfo,
			afterServiceContact,
			afterServiceManager,
			afterServicePhone,
		}: UpdateSellerProductRequest = await nextRequest.json();

		if (
			!productId ||
			!name ||
			!colorName ||
			!price ||
			!menuSubId ||
			!materialInfo ||
			!manufacturerName ||
			!countryOfOrigin ||
			!washCareInfo ||
			!manufacturedYm ||
			!qualityGuaranteeInfo ||
			!afterServiceContact
		)
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: UpdateSellerProductRequest = {
			productId,
			name,
			colorName,
			price,
			menuSubId,
			materialInfo,
			manufacturerName,
			countryOfOrigin,
			washCareInfo,
			manufacturedYm,
			qualityGuaranteeInfo,
			afterServiceContact,
			afterServiceManager,
			afterServicePhone,
		};

		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.SELLER_PRODUCT),
			{ ...payload },
			{
				Authorization: `Bearer ${sellerToken}`,
			},
		);
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
