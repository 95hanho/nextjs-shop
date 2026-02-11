import { BsChevronRight } from "react-icons/bs";
import styles from "../ProductDetail.module.scss";
import { useQuery } from "@tanstack/react-query";
import { GetProductDetailQnaResponse } from "@/types/product";
import { getNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";

interface QuestionAnswerProps {
	productId: number;
}

// 상품 QnA
export default function QuestionAnswer({ productId }: QuestionAnswerProps) {
	// QnA 조회
	const {
		data: qnaResponse,
		isSuccess,
		isError,
		isFetching,
	} = useQuery<GetProductDetailQnaResponse>({
		queryKey: ["productQnaList", productId],
		queryFn: () => getNormal(getApiUrl(API_URL.PRODUCT_DETAIL_QNA), { productId }),
		enabled: !!productId,
		refetchOnWindowFocus: false,
		select(data) {
			// console.log({ qnaResponse: data });
			return data;
		},
	});

	return (
		<>
			{isFetching && <div>QnA 불러오는 중...</div>}
			{isError && <div>QnA를 불러오지 못했어요.</div>}
			{isSuccess && (
				<section className={styles.qnaInfoSection}>
					<header className="flex justify-between pb-1">
						<span className="text-2xl font-extrabold">상품 Q&A</span>
						<button className="flex items-center gap-1 pr-1">
							<span>Q&A 작성</span>
							<span className="relative top-[1px]">
								<BsChevronRight />
							</span>
						</button>
					</header>
					<nav className="flex gap-2.5 mt-2">
						<button className="px-3 py-1 text-sm bg-gray-200 border rounded-full cursor-pointer text-slate-900 ">All</button>
						<button className="px-3 py-1 text-sm bg-gray-200 border rounded-full cursor-pointer text-slate-900">상품 문의</button>
						<button className="px-3 py-1 text-sm bg-gray-200 border rounded-full cursor-pointer text-slate-900">재입고문의</button>
						<button className="px-3 py-1 text-sm bg-gray-200 border rounded-full cursor-pointer text-slate-900">배송문의</button>
						<button className="px-3 py-1 text-sm bg-gray-200 border rounded-full cursor-pointer text-slate-900">기타</button>
					</nav>
					<section>
						<div>
							<div className="px-2 py-2">
								<h4 className="flex justify-between text-xs">
									<span>hoseo*******</span>
									<span>2025.12.29</span>
								</h4>
								<div className="flex justify-between mt-1">
									<span className="text-xs">[배송문의]</span>
									<span className="px-1 py-0.5 text-xs text-blue-600 border rounded-sm border-spacing-3 bg-sky-200">답변완료</span>
								</div>
								<div className="px-1 text-sm">
									<p>택배사가 어디인가요??</p>
								</div>
							</div>
							<hr />
							<div className="px-2 py-2">
								<h4 className="text-xs">답변</h4>
								<p className="py-1.5 text-sm">
									안녕하세요, 호텔827입니다.
									<br />
									문의 주셔서 감사합니다.
									<br />
									<br />
									호텔파리칠의 택배사의 경우 대한통운, 한진택배 두 곳을 이용하고 있습니다.
									<br />
									<br />
									오늘도 평온한 하루 보내세요 :D
									<br />
									감사합니다.
								</p>
								<h5 className="text-sm font-normal">호텔파리칠</h5>
							</div>
						</div>
					</section>
				</section>
			)}
		</>
	);
}
