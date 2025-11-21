import API_URL from "@/api/endpoints";
import { postUrlFormData } from "@/api/fetchFilter";
import { withAuth } from "@/lib/auth";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { writeReviewRequest } from "@/types/mypage";
import { NextResponse } from "next/server";

// 리뷰 작성
export const POST = withAuth(async ({ nextRequest, userId }) => {
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
		const data = await postUrlFormData<BaseResponse>(getBackendUrl(API_URL.MY_REVIEW), { ...payload });
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
