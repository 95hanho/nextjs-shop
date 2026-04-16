import { BsChevronRight } from "react-icons/bs";
import styles from "../ProductDetail.module.scss";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AddProductQnaRequest,
	GetProductDetailQnaResponse,
	ProductQnaItem,
	ProductQnaType,
	ProductQnaTypeCode,
	UpdateProductQnaRequest,
} from "@/types/product";
import { deleteNormal, getNormal, postJson, putJson } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { OnOffButton } from "@/components/ui/OnOffButton";
import clsx from "clsx";
import moment from "moment";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { useAuth } from "@/hooks/useAuth";
import { resolve } from "path";
import { ConfirmOkResult, DialogResultMap } from "@/store/modal.type";

// 상품 QnA
export default function QuestionAnswer({ sellerName }: { sellerName: string }) {
	const { loginOn, user } = useAuth();
	const { openDialog, dialogResult, clearDialogResult } = useGlobalDialogStore();
	const queryClient = useQueryClient();
	const params = useParams<{
		productId: string;
	}>();
	const productIdNum = Number(params.productId);

	// =================================================================
	// React Query
	// =================================================================

	// QnA 조회
	const {
		data: { productQnaList, productQnaTypeList } = {
			productQnaList: [],
			productQnaTypeList: [],
		},
		isSuccess,
		isError,
		isFetching,
	} = useQuery<
		GetProductDetailQnaResponse,
		Error,
		{
			productQnaList: ProductQnaItem[];
			productQnaTypeList: ProductQnaType[];
		}
	>({
		queryKey: ["productQnaList", productIdNum],
		queryFn: () => getNormal(getApiUrl(API_URL.PRODUCT_DETAIL_QNA), { productId: productIdNum }),
		enabled: !!productIdNum,
		refetchOnWindowFocus: false,
		select: (data) => ({
			productQnaList: data.productQnaList,
			productQnaTypeList: data.productQnaTypeList,
		}),
	});
	// QnA 등록
	const { mutate: addProductQna } = useMutation({
		mutationKey: ["addProductQna", productIdNum],
		mutationFn: (form: AddProductQnaRequest) => postJson(getApiUrl(API_URL.PRODUCT_DETAIL_QNA), { ...form, productId: productIdNum }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["productQnaList", productIdNum] });
		},
	});
	// QnA 수정
	const { mutate: updateProductQna } = useMutation({
		mutationKey: ["updateProductQna", productIdNum],
		mutationFn: (form: UpdateProductQnaRequest) => putJson(getApiUrl(API_URL.PRODUCT_DETAIL_QNA), { ...form, productId: productIdNum }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["productQnaList", productIdNum] });
		},
	});

	// QnA 삭제
	const { mutate: deleteProductQna } = useMutation({
		mutationKey: ["deleteProductQna", productIdNum],
		mutationFn: (productQnaId: number) => deleteNormal(getApiUrl(API_URL.PRODUCT_DETAIL_QNA_DELETE), { productQnaId, productId: productIdNum }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["productQnaList", productIdNum] });
		},
	});

	// =================================================================
	// React
	// =================================================================

	// QnA 작성 뷰
	const [qnaViewOpen, setQnaViewOpen] = useState(false);
	// Qna 작성 폼
	const [qnaForm, setQnaForm] = useState({
		productQnaTypeId: 1,
		question: "",
		secret: false,
	});
	// Qna 필터링 코드
	const [qnaFilterCode, setQnaFilterCode] = useState<"ALL" | ProductQnaTypeCode>("ALL");
	// qna 페이징 객체
	const [qnaPage, setQnaPage] = useState({
		page: 1,
		totalPage: 1,
	});
	// 답변오픈 할 QnA 아이디
	const [answerOpenQnaId, setAnswerOpenQnaId] = useState<number | null>(null);

	// QnA 작성 제출
	const handleQnaSubmit = () => {
		if (!qnaForm.question.trim()) {
			openDialog("ALERT", { content: "문의 내용을 입력해주세요." });
			return;
		}
		if (qnaForm.question.trim().length > 300) {
			openDialog("ALERT", { content: "문의 내용은 300자 이하로 입력해주세요." });
			return;
		}
		// 줄바꿈 갯수는 10개로 제한
		const lineBreakCount = (qnaForm.question.match(/\n/g)?.length || 0) + 1;
		if (lineBreakCount > 10) {
			openDialog("ALERT", { content: "문의 내용은 줄바꿈을 10회 이하로 입력해주세요." });
			return;
		}
		addProductQna(qnaForm);
	};

	// =================================================================
	// useEffect, useMemo
	// =================================================================

	type ProductQnaTypeWithCountList = ProductQnaType & {
		count: number;
	};
	const productQnaTypeWithCountList: ProductQnaTypeWithCountList[] = useMemo(() => {
		return productQnaTypeList.map((type) => {
			return {
				...type,
				count: productQnaList.filter((qna) => qna.productQnaTypeId === type.productQnaTypeId).length,
			};
		});
	}, [productQnaTypeList, productQnaList]);
	useEffect(() => {
		if (productQnaList.length > 0) {
			const totalPage = Math.ceil(productQnaList.filter((qna) => qnaFilterCode === "ALL" || qna.qnaTypeCode === qnaFilterCode).length / 5);
			setQnaPage({
				page: 1,
				totalPage,
			});
		}
	}, [productQnaList, qnaFilterCode]);
	const { productQnaCurPageList } = useMemo(() => {
		const startIdx = (qnaPage.page - 1) * 5;
		const endIdx = startIdx + 5;
		return {
			productQnaCurPageList: productQnaList
				.filter((qna) => qnaFilterCode === "ALL" || qna.qnaTypeCode === qnaFilterCode)
				.slice(startIdx, endIdx),
		};
	}, [productQnaList, qnaFilterCode, qnaPage.page]);
	// useEffect(() => {
	// 	if (!dialogResult) return;
	// 	if (dialogResult.action === "CONFIRM_OK") {
	// 		const payload = dialogResult.payload as DialogResultMap["CONFIRM_OK"];
	// 		if (payload?.result === "QNA_DELETE_OK") {
	// 			deleteProductQna(payload.productQnaId);
	// 		}
	// 	}
	// 	clearDialogResult();
	// }, [dialogResult, clearDialogResult]);

	return (
		<>
			{isFetching && <div>QnA 불러오는 중...</div>}
			{isError && <div>QnA를 불러오지 못했어요.</div>}
			{isSuccess && (
				<section className={styles.qnaInfoSection}>
					<header className="flex justify-between pb-1 mb-2">
						<span className="text-2xl font-extrabold">상품 Q&A</span>
						{!qnaViewOpen && (
							<button
								className="flex items-center gap-1 pr-1"
								onClick={() => {
									if (!loginOn) {
										openDialog("ALERT", { content: "로그인이 필요한 서비스입니다." });
										return;
									}
									setQnaViewOpen(true);
								}}
							>
								<span>Q&A 작성</span>
								<span className="relative top-[1px]">
									<BsChevronRight />
								</span>
							</button>
						)}
					</header>
					{qnaViewOpen ? (
						<>
							<hr />
							<article className="p-3 bg-gray-100">
								<header>
									<h3>Q&A 작성</h3>
								</header>
								<nav className={clsx("flex gap-2.5 mt-3", styles.qnaFilterNav)}>
									{productQnaTypeList.map((type) => (
										<button
											key={`qnaWriting-${type.productQnaTypeId}`}
											className={clsx("px-3 py-1 text-sm bg-gray-200 border rounded-full cursor-pointer text-slate-900", {
												[styles.on]: qnaForm.productQnaTypeId === type.productQnaTypeId,
											})}
											onClick={() => setQnaForm({ ...qnaForm, productQnaTypeId: type.productQnaTypeId })}
										>
											{type.name}
										</button>
									))}
								</nav>
								<section className="px-2 mt-3">
									<div className="flex">
										<label htmlFor="qnaContent" className="pt-4 text-lg select-none whitespace-nowrap">
											문의내용
										</label>
										<textarea
											name="qnaContent"
											id="qnaContent"
											cols={30}
											rows={3}
											className="w-full p-2 mt-1 ml-10 border rounded-md resize-none"
											value={qnaForm.question}
											onChange={(e) => {
												setQnaForm((prev) => ({
													...prev,
													question: e.target.value,
												}));
											}}
											onBlur={(e) => {
												setQnaForm((prev) => ({
													...prev,
													question: e.target.value.trim(),
												}));
											}}
										></textarea>
									</div>
									<div className="px-1 mt-1 text-sm text-right">{qnaForm.question.trim().length} / 300</div>
									<div className="mt-1 text-right">
										<label htmlFor="qnaSecret" className="select-none">
											비밀글 여부
										</label>
										<OnOffButton
											checkId="qnaSecret"
											checked={qnaForm.secret}
											onChange={(checked) => {
												setQnaForm((prev) => ({
													...prev,
													secret: checked,
												}));
											}}
											size="sm"
										/>
									</div>
									<p className="mt-2 text-sm text-right">※ 답변 전까지만 수정 및 비밀글로 설정할 수 있습니다.</p>
									<div className="mt-1 text-right">
										<button className="text-base" onClick={handleQnaSubmit}>
											작성완료
										</button>
										<button onClick={() => setQnaViewOpen(false)} className="ml-4 text-base">
											취소
										</button>
									</div>
								</section>
							</article>
							<hr />
						</>
					) : (
						<article className="px-4 py-3 bg-gray-100">
							<nav className={clsx("flex gap-2.5 mt-2", styles.qnaFilterNav)}>
								<button
									className={clsx("px-3 py-1 text-sm bg-gray-200 border rounded-full cursor-pointer text-slate-900", {
										[styles.on]: qnaFilterCode === "ALL",
									})}
									onClick={() => setQnaFilterCode("ALL")}
								>
									전체({productQnaList.length})
								</button>
								{productQnaTypeWithCountList.map((type) => (
									<button
										key={`qnaView-${type.productQnaTypeId}`}
										className={clsx("px-3 py-1 text-sm bg-gray-200 border rounded-full cursor-pointer text-slate-900", {
											[styles.on]: qnaFilterCode === type.code,
										})}
										onClick={() => setQnaFilterCode(type.code)}
									>
										{type.name}({type.count})
									</button>
								))}
							</nav>
							<section className="mt-3">
								{productQnaList.length === 0 && <div className="py-10 text-center">등록된 Q&A가 없습니다.</div>}
								{productQnaCurPageList.length > 0 &&
									productQnaCurPageList.map((qna) => {
										// 본인 QnA 여부
										const isMyQna = qna.userName === user?.name;

										return (
											<div
												key={`qna-${qna.productQnaId}`}
												className={clsx(
													"border-0 border-t-2 border-black border-solid select-none",
													isMyQna && "bg-orange-100",
												)}
											>
												<div
													className={clsx(
														"px-2 py-3",
														qna.answer &&
															(isMyQna ? "cursor-pointer hover:bg-gray-200" : "cursor-pointer hover:bg-orange-200"),
													)}
													onClick={() => {
														if (!qna.answer) return; // 답변이 없는 경우 클릭 이벤트 없음
														setAnswerOpenQnaId((prev) => (prev === qna.productQnaId ? null : qna.productQnaId));
													}}
												>
													<h4 className="flex justify-between text-xs">
														<span className="inline-flex items-center">
															{qna.userName}
															{isMyQna && qna.secret && (
																<span className="px-1 py-0.5 text-xs text-orange-500 border rounded-sm border-spacing-3 bg-orange-200 ml-1">
																	비밀글
																</span>
															)}
														</span>
														<span>{moment(qna.createdAt).format("YYYY.MM.DD")}</span>
													</h4>
													<div className="flex justify-between mt-1">
														<span className="text-xs">[{qna.qnaTypeName}]</span>
														{qna.answer && (
															<span className="px-1 py-0.5 text-xs text-blue-600 border rounded-sm border-spacing-3 bg-sky-200">
																답변완료
															</span>
														)}
													</div>
													<div className="px-1 mt-2 text-sm">
														{qna.question ? (
															<p
																dangerouslySetInnerHTML={{
																	__html: qna.question.replace(/\n/g, "<br />"),
																}}
															></p>
														) : (
															<span className="text-gray-500">[비밀글입니다.]</span>
														)}
													</div>
													<div className="text-right">
														{isMyQna && !qna.answer && (
															<>
																<button className="text-base">수정</button>
																<button
																	className="ml-2 text-base"
																	onClick={() => {
																		openDialog("CONFIRM", {
																			content: "정말 삭제하시겠습니까?",
																			// okResult: "QNA_DELETE_OK",
																			handleAfterOk: () => {
																				console.log(123);
																			},
																		});
																	}}
																>
																	삭제
																</button>
															</>
														)}
													</div>
												</div>
												{answerOpenQnaId === qna.productQnaId && (
													<>
														<hr />
														<div className="flex px-5 py-3 bg-blue-100">
															<div>ㄴ</div>
															<div>
																<h4 className="text-xs">답변</h4>
																<p className="py-1.5 text-sm">{qna.answer}</p>
																<h5 className="text-sm font-normal">{sellerName}</h5>
															</div>
														</div>
													</>
												)}
											</div>
										);
									})}
								<div>
									{qnaPage.totalPage > 1 && (
										<nav className="flex justify-center gap-2 mt-4">
											<button
												className={clsx("px-3 py-1 text-sm bg-gray-200 border rounded-full cursor-pointer text-slate-900", {
													"cursor-not-allowed opacity-50": qnaPage.page === 1,
												})}
												onClick={() => setQnaPage((prev) => ({ ...prev, page: prev.page - 1 }))}
												disabled={qnaPage.page === 1}
											>
												이전
											</button>
											<span>
												{qnaPage.page} / {qnaPage.totalPage}
											</span>
											<button
												className={clsx("px-3 py-1 text-sm bg-gray-200 border rounded-full cursor-pointer text-slate-900", {
													"cursor-not-allowed opacity-50": qnaPage.page === qnaPage.totalPage,
												})}
												onClick={() => setQnaPage((prev) => ({ ...prev, page: prev.page + 1 }))}
												disabled={qnaPage.page === qnaPage.totalPage}
											>
												다음
											</button>
										</nav>
									)}
								</div>
							</section>
						</article>
					)}
				</section>
			)}
		</>
	);
}
