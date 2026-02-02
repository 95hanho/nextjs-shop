import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postUrlFormData, putUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { GetUserAddressListResponse, setUserAddressRequest } from "@/types/mypage";
import { NextResponse } from "next/server";

// 유저배송지 조회
export const GET = withAuth(async ({ accessToken }) => {
	try {
		const data = await getNormal<GetUserAddressListResponse>(getBackendUrl(API_URL.MY_ADDRESS), undefined, {
			Authorization: `Bearer ${accessToken}`,
		});
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 유저배송지 추가
export const POST = withAuth(async ({ nextRequest, accessToken }) => {
	try {
		const { addressName, recipientName, addressPhone, zonecode, address, addressDetail, memo, defaultAddress }: setUserAddressRequest =
			await nextRequest.json();
		console.log(
			"addressName",
			addressName,
			"recipientName",
			recipientName,
			"addressPhone",
			addressPhone,
			"zonecode",
			zonecode,
			"address",
			address,
			"addressDetail",
			addressDetail,
			"memo",
			memo,
			"defaultAddress",
			defaultAddress,
		);
		if (!addressName || !recipientName || !addressPhone || !zonecode || !address || !addressDetail)
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: setUserAddressRequest = { addressName, addressPhone, recipientName, zonecode, address, addressDetail, memo, defaultAddress };
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.MY_ADDRESS),
			{ ...payload },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 유저배송지 수정
export const PUT = withAuth(async ({ nextRequest, accessToken }) => {
	try {
		const { addressId, addressName, recipientName, addressPhone, zonecode, address, addressDetail, memo, defaultAddress }: setUserAddressRequest =
			await nextRequest.json();
		console.log(
			"addressId",
			addressId,
			"addressName",
			addressName,
			"recipientName",
			recipientName,
			"addressPhone",
			addressPhone,
			"zonecode",
			zonecode,
			"address",
			address,
			"addressDetail",
			addressDetail,
			"memo",
			memo,
			"defaultAddress",
			defaultAddress,
		);
		if (!addressName || !recipientName || !addressPhone || !zonecode || !address || !addressDetail)
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: setUserAddressRequest = {
			addressId,
			addressName,
			addressPhone,
			recipientName,
			zonecode,
			address,
			addressDetail,
			memo,
			defaultAddress,
		};
		console.log(payload);
		const data = await putUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.MY_ADDRESS),
			{ ...payload },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
