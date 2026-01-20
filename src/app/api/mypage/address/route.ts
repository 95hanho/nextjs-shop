import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
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
// 유저배송지 추가/수정
export const POST = withAuth(async ({ nextRequest, accessToken }) => {
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
			defaultAddress
		);
		if (!addressName || !recipientName || !addressPhone || !zonecode || !address || !addressDetail)
			return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });
		// if (!memo) return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });

		const payload: setUserAddressRequest = { addressName, addressPhone, recipientName, zonecode, address, addressDetail, memo, defaultAddress };
		if (addressId) payload.addressId = addressId;
		console.log(payload);
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.MY_ADDRESS),
			{ ...payload },
			{
				Authorization: `Bearer ${accessToken}`,
			}
		);
		console.log("data", data);

		return NextResponse.json({ message: "SUCCESS" }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
