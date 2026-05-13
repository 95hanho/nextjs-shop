import API_URL from "@/api/endpoints";
import { postJson, RequestHeaders } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { PhoneAuthMode, PhoneAuthRequest } from "@/types/auth";
import { SellerPhoneAuthUiResponse } from "@/types/seller";
import { useMutation } from "@tanstack/react-query";

// 휴대폰 인증
export function usePhoneAuth(mode: PhoneAuthMode) {
	// 1) [store / providers / custom hooks] -------------------------------------------
	const { openDialog } = useGlobalDialogStore();

	// 4) [derived values / useMemo] ---------------------------------------
	const headers: RequestHeaders = {};
	if (mode === "CHANGE") {
		headers["x-auth-mode"] = "required";
	}

	return useMutation({
		mutationFn: ({ phone, userId }: { phone: string; userId?: string }) => {
			const payload: PhoneAuthRequest = { phone, mode };
			if (userId) payload.userId = userId;
			return postJson<SellerPhoneAuthUiResponse, PhoneAuthRequest>(getApiUrl(API_URL.AUTH_PHONE_AUTH), { ...payload }, headers);
		},
		onSuccess(data) {
			if (data.testCode) {
				openDialog("ALERT", {
					content: "[테스트 모드] 인증번호: " + data.testCode,
				});
			}
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
