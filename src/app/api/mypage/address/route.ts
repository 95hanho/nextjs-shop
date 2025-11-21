import API_URL from "@/api/endpoints";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { GetUserAddressListResponse, setUserAddressRequest } from "@/types/mypage";
import { NextResponse } from "next/server";

// 유저배송지 조회
export const GET = withAuth(async ({ userId }) => {
	try {
		if (!userId) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });
		const data = await getNormal<GetUserAddressListResponse>(getBackendUrl(API_URL.MY_ADDRESS), { userId });
		console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
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
// 유저배송지 추가/수정
export const POST = withAuth(async ({ nextRequest }) => {
	try {
		const { addressId, addressName, addressPhone, zonecode, address, addressDetail, memo, isDefault }: setUserAddressRequest =
			await nextRequest.json();
		if (!addressName) return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });
		if (!addressPhone) return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });
		if (!zonecode) return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });
		if (!address) return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });
		if (!addressDetail) return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });
		// if (!memo) return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });
		if (isDefault === undefined) return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });

		const payload: setUserAddressRequest = { addressName, addressPhone, zonecode, address, addressDetail, memo, default: isDefault };
		if (addressId) payload.addressId = addressId;
		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.MY_ADDRESS), { ...payload });
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
});
