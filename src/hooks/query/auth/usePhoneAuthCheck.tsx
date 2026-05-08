import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { PhoneAuthCheckRequest } from "@/types/auth";
import { BaseResponse } from "@/types/common";
import { useMutation } from "@tanstack/react-query";

type PhoneAuthCheckResponse = BaseResponse & {
	userId?: string;
};

// 휴대폰 인증 확인
export function usePhoneAuthCheck() {
	return useMutation({
		mutationFn: ({ authNumber, phoneAuthToken }: PhoneAuthCheckRequest) =>
			postJson<PhoneAuthCheckResponse>(getApiUrl(API_URL.AUTH_PHONE_AUTH_CHECK), {
				phoneAuthToken,
				authNumber,
			}),
	});
}
