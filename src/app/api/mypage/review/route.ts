import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal, postUrlFormData, putUrlFormData } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { ReviewOrderInfoResponse, UpdateReviewRequest, WriteReviewRequest } from "@/types/mypage";
import { NextResponse } from "next/server";

// 리뷰 주문정보 조회
export const GET = userWithAuth(async ({ nextRequest, accessToken }) => {
	console.log("[API] 리뷰 주문정보 조회");
	try {
		const orderItemId = nextRequest.nextUrl.searchParams.get("orderItemId");
		if (!orderItemId) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const data = await getNormal<ReviewOrderInfoResponse>(
			getBackendUrl(API_URL.MY_REVIEW),
			{ orderItemId },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		console.log({ data });

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 리뷰 작성
export const POST = userWithAuth(async ({ nextRequest, accessToken }) => {
	console.log("[API] 리뷰 작성");
	try {
		const { content, rating, orderItemId }: WriteReviewRequest = await nextRequest.json();
		if (!content || !rating || !orderItemId) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: WriteReviewRequest = { content, rating, orderItemId };
		const data = await postUrlFormData<BaseResponse & { reviewId: number }>(
			getBackendUrl(API_URL.MY_REVIEW),
			{ ...payload },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		// console.log("data", data);

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
// 리뷰 수정
export const PUT = userWithAuth(async ({ nextRequest, accessToken }) => {
	console.log("[API] 리뷰 수정");
	try {
		const { reviewId, content, rating }: UpdateReviewRequest = await nextRequest.json();
		if (!content || !rating || !reviewId) return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		const payload: UpdateReviewRequest = { content, rating, reviewId };
		const data = await putUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.MY_REVIEW),
			{ ...payload },
			{
				Authorization: `Bearer ${accessToken}`,
			},
		);
		// console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
