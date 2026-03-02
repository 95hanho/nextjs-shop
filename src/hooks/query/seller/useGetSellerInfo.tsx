import API_URL from "@/api/endpoints";
import { toErrorResponse } from "@/api/error";
import { getNormal } from "@/api/fetchFilter";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetSellerInfoResponse } from "@/types/seller";
import { useQuery } from "@tanstack/react-query";

export function useGetSellerInfo() {
	const { seller: initialSeller, setSeller } = useSellerAuth();

	return useQuery({
		queryKey: ["sellerInfo"],
		queryFn: async () => {
			try {
				const data = await getNormal<GetSellerInfoResponse>(getApiUrl(API_URL.SELLER));
				const seller = data.seller ?? null; // undefined 방지
				// console.log("seller", seller);
				setSeller(seller);
				return seller;
			} catch (err: unknown) {
				const { status, payload } = toErrorResponse(err);

				// ✅ 비로그인 정상 케이스: 에러로 보지 말고 익명 처리
				if (status === 401 || payload?.message === "UNAUTHORIZED" || payload?.message === "SESSION_EXPIRED") {
					setSeller(initialSeller);
					return initialSeller;
				}

				// 그 외만 진짜 에러로 던짐 (전역 에러 핸들러가 처리)
				throw err;
			}
		},
		initialData: initialSeller ?? null,
		// =========================================
		// 처음 새로고침 시 + 로그인, 로그아웃시 수동으로만 다시가져올꺼.
		// =========================================
		retry: false,
		staleTime: Infinity,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: "always", // ✅ 새로고침/첫 진입에서만 1번 확인
	});
}
