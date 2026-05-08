import API_URL from "@/api/endpoints";
import { postJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { BaseResponse } from "@/types/common";
import { useMutation } from "@tanstack/react-query";

// 쿠폰 다운로드
export function useCouponDownload() {
	return useMutation({
		mutationFn: (couponId: number) => postJson<BaseResponse & { userCouponId: number }>(getApiUrl(API_URL.PRODUCT_COUPON_DOWNLOAD), { couponId }),
		onError(err) {
			console.log("couponDownload err", err);
		},
	});
}
