import API_URL from "@/api/endpoints";
import { getNormal, postUrlFormData } from "@/api/fetchFilter";
import { getServerUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { NextApiRequest, NextApiResponse } from "next";

/*  */
export default async function handler(nextRequest: NextApiRequest, nextResponse: NextApiResponse) {
	console.log("method :", nextRequest.method, "url :", nextRequest.url);
	if (Object.keys(nextRequest.query).length > 0) {
		console.log("query :", nextRequest.query);
	}

	try {
		// method별 요청처리
		//
		if (nextRequest.method === "GET") {
			// const { userId } = nextRequest.query;
			// if (!userId) return nextResponse.status(400).json({ message: "아이디를 입력해주세요." });
			// const data = await getNormal<BaseResponse>(getServerUrl(API_URL.USER_ID), { userId });
			// console.log("data", data);
			// return nextResponse.status(200).json({ message: data.message });
		}
		// 판매자 추가
		if (nextRequest.method === "POST") {
			const { sellerId, password, businessRegistrationNumber, extensionNumber, mobileNumber, email } = nextRequest.body;
			if (!sellerId) return nextResponse.status(400).json({ message: "아이디를 입력해주세요." });
			if (!password) return nextResponse.status(400).json({ message: "비밀번호를 입력해주세요." });
			if (!businessRegistrationNumber) return nextResponse.status(400).json({ message: "사업자등록번호를 입력해주세요." });
			if (!extensionNumber) return nextResponse.status(400).json({ message: "내선 전화번호를 입력해주세요." });
			if (!mobileNumber) return nextResponse.status(400).json({ message: "휴대폰번호를 입력해주세요." });
			if (!email) return nextResponse.status(400).json({ message: "이메일를 입력해주세요." });

			const data = await postUrlFormData<BaseResponse>(getServerUrl(API_URL.USER), {
				sellerId,
				password,
				businessRegistrationNumber,
				extensionNumber,
				mobileNumber,
				email,
			});
			console.log("data", data);

			return nextResponse.status(200).json({ message: data.message });
		}
		return nextResponse.status(405).json({ message: "Method not allowed" });
	} catch (err: any) {
		console.error("error :", {
			message: err.message,
			status: err.status,
			data: err.data,
		});

		const status = Number.isInteger(err?.status) ? err.status : 500;
		const payload = err?.data && typeof err.data === "object" ? err.data : { message: err?.message || "SERVER_ERROR" };

		return nextResponse.status(status).json(payload);
	}
}
