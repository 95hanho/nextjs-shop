import API_URL from "@/api/endpoints";
import { postJson, RequestHeaders } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { PhoneAuthMode, PhoneAuthRequest } from "@/types/auth";
import { BaseResponse } from "@/types/common";
import { useMutation } from "@tanstack/react-query";

export function usePhoneAuth(mode: PhoneAuthMode, required: boolean = false) {
	// 1) [store / custom hooks] -------------------------------------------
	const { openDialog } = useGlobalDialogStore();

	// 4) [derived values / useMemo] ---------------------------------------
	const headers: RequestHeaders = {};
	if (required) {
		headers["x-auth-mode"] = "required";
	}

	return useMutation({
		mutationFn: ({ phone, userId }: { phone: string; userId?: string }) => {
			const payload: PhoneAuthRequest = { phone, mode };
			if (userId) payload.userId = userId;
			return postJson<BaseResponse & { phoneAuthToken: string }, PhoneAuthRequest>(getApiUrl(API_URL.AUTH_PHONE_AUTH), { ...payload }, headers);
		},
		onError(err) {
			console.log(err);
			if (mode === "PWDFIND" && err.message === "PWD_FIND_USER_NOT_FOUND") {
				openDialog("ALERT", {
					content: "해당 아이디와 휴대폰 번호가 일치하는 사용자를 찾을 수 없습니다.",
				});
			}
		},
	});
}
