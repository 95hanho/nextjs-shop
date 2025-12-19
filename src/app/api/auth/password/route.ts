import { withAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

// 비밀번호 변경
export const POST = withAuth(async ({ nextRequest, userId, params }) => {
	try {
		const {} = params ?? {};
		// formdata || application/x-www-form-urlencoded로 보내면 이렇게
		// const formData = await nextRequest.formData();
		// const userId = formData.get("userId");
		// const password = formData.get("password");
		// json으로 받으면
		const { userId, password } = await nextRequest.json();
		if (!userId) return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });
		if (!password) return NextResponse.json({ message: "비밀번호를 입력해주세요." }, { status: 400 });
		const data = await postUrlFormData<BaseResponse>(
			getBackendUrl(API_URL.AUTH),
			{ userId, password },
			{
				["X-Password-Reset-Token"]: "",
			}
		);
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
