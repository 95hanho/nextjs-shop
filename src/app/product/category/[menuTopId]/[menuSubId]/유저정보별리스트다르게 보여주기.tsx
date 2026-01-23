import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic"; // 유저별이면 사실상 필수

interface ProductListParams {
	params: {
		menuSubId: number;
		menuTopId: number;
	};
	searchParams: {
		page?: string;
		sort?: string;
		keyword?: string;
	};
}

export default async function CategoryProductList({
	params: { menuSubId, menuTopId },
	searchParams: { keyword, page = 1, sort = "latest" },
}: ProductListParams) {
	console.log(menuSubId, menuTopId);

	const accessToken = cookies().get("accessToken")?.value; // HttpOnly 쿠키 OK
	console.log("서버에서 accessToken", accessToken);

	const productList = await getNormal(getApiUrl(API_URL.PRODUCT), {
		sort,
		menuSubId,
	});
	console.log(productList);

	return (
		<main id="productList">
			<div className="product-wrap"></div>
		</main>
	);
}

/* ========================================================== */

("use client");

import { useQuery } from "@tanstack/react-query";

type Props = {
	menuSubId: number;
	sort: string;
	initialList: GetProductListResponse | null;
	isLoggedIn: boolean;
};

export default function ClientProductList({ menuSubId, sort, initialList, isLoggedIn }: Props) {
	const shouldFetchPersonalized = isLoggedIn && initialList === null;

	const { data, isLoading } = useQuery<GetProductListResponse>({
		queryKey: ["productList", menuSubId, sort, "personalized"],
		queryFn: async () => {
			// ✅ Next API route를 추천: HttpOnly 쿠키가 자동으로 붙어서 인증이 쉬움
			const res = await fetch(`/api/product?sort=${sort}&menuSubId=${menuSubId}`, {
				cache: "no-store",
			});
			if (!res.ok) throw new Error("failed");
			return res.json();
		},
		enabled: shouldFetchPersonalized,
		// initialList가 null이면 여기 넣지 않음
	});

	const list = initialList ?? data;

	if (!list) {
		// ✅ 로그인 상태: 공용 리스트를 아예 안 보여주고 스켈레톤만
		return <div className="product-wrap">로딩중...</div>;
	}

	return (
		<div className="product-wrap">
			{/* list 렌더 */}
			{isLoading && shouldFetchPersonalized ? <div>로딩중...</div> : null}
		</div>
	);
}
