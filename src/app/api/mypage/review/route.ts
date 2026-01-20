import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { writeReviewRequest } from "@/types/mypage";
import { NextResponse } from "next/server";

// 리뷰 작성
export const POST = withAuth(async ({ nextRequest, accessToken }) => {
	try {
		// formdata || application/x-www-form-urlencoded로 보내면 이렇게
		// const formData = await nextRequest.formData();
		// const userId = formData.get("userId");
		// const password = formData.get("password");
		// json으로 받으면
		const { content, rating, orderListId }: writeReviewRequest = await nextRequest.json();
		if (!content) return NextResponse.json({ message: "내용을 입력해주세요." }, { status: 400 });
		if (!rating) return NextResponse.json({ message: "별점을 입력해주세요." }, { status: 400 });
		if (!orderListId) return NextResponse.json({ message: "잘 못 된 요청입니다." }, { status: 400 });

		const payload: writeReviewRequest = { content, rating, orderListId };
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.MY_REVIEW),
			{ ...payload },
			{
				Authorization: `Bearer ${accessToken}`,
			}
		);
		console.log("data", data);

		return NextResponse.json({ message: data.message }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
