import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { postMultipart } from "@/api/fetchFilter";
import { userWithAuth } from "@/lib/auth/user";
import { WRONG_REQUEST_MESSAGE } from "@/lib/env";
import { getBackendUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { SetReviewImageRequest } from "@/types/mypage";
import { NextResponse } from "next/server";

// 리뷰 이미지 설정
export const POST = userWithAuth(async ({ nextRequest, accessToken }) => {
	console.log("[API] 리뷰 이미지 설정");
	try {
		const formData = await nextRequest.formData();
		const requestRaw = formData.get("request");
		const files = formData.getAll("files") as File[];
		if (typeof requestRaw !== "string") {
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });
		}
		const { reviewId, addFiles, updateFiles, deleteImageIds }: SetReviewImageRequest = JSON.parse(requestRaw);

		const hasAnyChange = addFiles.length > 0 || updateFiles.length > 0 || deleteImageIds.length > 0;
		if (reviewId === undefined || addFiles === undefined || updateFiles === undefined || deleteImageIds === undefined || !hasAnyChange)
			return NextResponse.json({ message: WRONG_REQUEST_MESSAGE }, { status: 400 });

		// Spring 보낼꺼 다시 만들기
		const outboundFormData = new FormData();
		files.forEach((file) => {
			outboundFormData.append("files", file, file.name);
		});
		outboundFormData.append("request", new Blob([requestRaw], { type: "application/json" }));

		const data: BaseResponse = await postMultipart(getBackendUrl(API_URL.MY_REVIEW_IMAGE), outboundFormData, {
			Authorization: `Bearer ${accessToken}`,
		});

		return NextResponse.json({ ...data }, { status: 200 });
	} catch (err: unknown) {
		const { status, payload } = toErrorResponse(err);
		return NextResponse.json(payload, { status });
	}
});
