import API_URL from "@/api/endpoints";
import { getNormal, postJson } from "@/api/fetchFilter";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetSellerQnaResponse, SellerQna, UpdateQnaAnswerRequest } from "@/types/seller";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import styles from "./SellerMain.module.scss";
import { TurnToPagination } from "@/components/ui/TurnToPagination";
import clsx from "clsx";
import { ProductQnaType, ProductQnaTypeCode } from "@/types/product";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import moment from "moment";

export default function QuestionAnswerList() {
	const { loginOn } = useSellerAuth();
	const { openDialog } = useGlobalDialogStore();
	const queryClient = useQueryClient();

	// ------------------------------------------------
	// React Query
	// ------------------------------------------------

	// 판매자 제품 리스트 조회
	const {
		data: { sellerQnaList, qnaTypeList } = { sellerQnaList: [], qnaTypeList: [] },
		// isFetching,
	} = useQuery<GetSellerQnaResponse, Error, { sellerQnaList: SellerQna[]; qnaTypeList: ProductQnaType[] }>({
		queryKey: ["sellerQnaList"],
		queryFn: () => getNormal(getApiUrl(API_URL.SELLER_QNA)),
		select: (data) => {
			return {
				sellerQnaList: data.sellerQnaList,
				qnaTypeList: data.qnaTypeList,
			};
		},
		enabled: loginOn,
		refetchOnWindowFocus: false,
	});
	// 판매자 QnA 답변 등록/수정
	const { mutate: updateQnaAnswer } = useMutation({
		mutationKey: ["updateQnaAnswer"],
		mutationFn: (answerForm: UpdateQnaAnswerRequest) =>
			postJson(getApiUrl(API_URL.SELLER_QNA), {
				...answerForm,
			}),
		onSuccess: () => {
			openDialog("ALERT", {
				content: "QnA 답변이 등록/수정되었습니다.",
				handleAfterClose: () => {
					queryClient.invalidateQueries({ queryKey: ["sellerQnaList"] });
				},
			});
		},
		onError: (err) => {
			if (err.message === "QNA_ANSWER_ALREADY_READ") {
				openDialog("ALERT", {
					content: "이미 읽힌 QnA에는 답변을 수정할 수 없습니다.",
					handleAfterClose: () => {
						queryClient.invalidateQueries({ queryKey: ["sellerQnaList"] });
					},
				});
			}
		},
		onSettled: () => {
			setQnaAnswerForm({
				productQnaId: 0,
				answer: "",
			});
		},
	});

	// ------------------------------------------------
	// React
	// ------------------------------------------------

	// Qna 필터링 코드
	const [qnaFilterCode, setQnaFilterCode] = useState<"ALL" | ProductQnaTypeCode>("ALL");
	// qna 페이징 객체
	const [qnaPage, setQnaPage] = useState({
		page: 1,
		totalPage: 1,
	});
	// 답변오픈 할 QnA 아이디
	const [qnaAnswerForm, setQnaAnswerForm] = useState({
		productQnaId: 0,
		answer: "",
	});
	// QnA 답변 등록/수정 핸들러
	const handleUpdateQnaAnswer = async () => {
		if (!qnaAnswerForm.answer) {
			openDialog("ALERT", {
				content: "답변 내용을 입력해주세요.",
			});
		}
		updateQnaAnswer(qnaAnswerForm);
	};

	// ------------------------------------------------
	// useEffect, useMemo
	// ------------------------------------------------

	type sellerQnaWithCountList = ProductQnaType & {
		count: number;
	};
	const productQnaTypeWithCountList: sellerQnaWithCountList[] = useMemo(() => {
		return qnaTypeList.map((type) => {
			return {
				...type,
				count: sellerQnaList.filter((qna) => qna.productQnaTypeId === type.productQnaTypeId).length,
			};
		});
	}, [qnaTypeList, sellerQnaList]);

	useEffect(() => {
		if (sellerQnaList.length > 0) {
			console.log({ sellerQnaList });
			const totalPage = Math.ceil(
				sellerQnaList.filter((qna) => qnaFilterCode === "ALL" || qna.productQnaTypeCode === qnaFilterCode).length / 5,
			);
			setQnaPage({
				page: 1,
				totalPage,
			});
		}
	}, [sellerQnaList, qnaFilterCode]);
	const { productQnaCurPageList } = useMemo(() => {
		const startIdx = (qnaPage.page - 1) * 5;
		const endIdx = startIdx + 5;
		return {
			productQnaCurPageList: sellerQnaList
				.filter((qna) => qnaFilterCode === "ALL" || qna.productQnaTypeCode === qnaFilterCode)
				.slice(startIdx, endIdx),
		};
	}, [sellerQnaList, qnaFilterCode, qnaPage.page]);

	return (
		<div id="questionAnswerList" className={styles.questionAnswerList}>
			<h2>QnA</h2>
			<article className="px-4 py-3 bg-gray-100">
				<nav className={clsx("flex gap-2.5 mt-2", styles.qnaFilterNav)}>
					<button
						className={clsx("px-3 py-1 text-sm bg-gray-200 border rounded-full cursor-pointer text-slate-900", {
							[styles.on]: qnaFilterCode === "ALL",
						})}
						onClick={() => setQnaFilterCode("ALL")}
					>
						전체({sellerQnaList.length})
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
					{sellerQnaList.length === 0 && <div className="py-10 text-center">등록된 Q&A가 없습니다.</div>}
					{productQnaCurPageList.length > 0 &&
						productQnaCurPageList.map((qna) => {
							return (
								<div key={`qna-${qna.productQnaId}`} className={clsx("border-0 border-t-2 border-black border-solid select-none")}>
									<div
										className={clsx("px-2 py-3 cursor-pointer hover:bg-orange-200")}
										onClick={() => {
											setQnaAnswerForm({
												productQnaId: qnaAnswerForm.productQnaId === qna.productQnaId ? 0 : qna.productQnaId,
												answer: qna.answer || "",
											});
										}}
									>
										<h4 className="flex justify-between text-xs">
											<span className="inline-flex items-center">
												{qna.userName}
												{qna.secret && (
													<span className="px-1 py-0.5 text-xs text-orange-500 border rounded-sm border-spacing-3 bg-orange-200 ml-1">
														비밀글
													</span>
												)}
											</span>
											<span>{moment(qna.createdAt).format("YYYY.MM.DD HH:mm")}</span>
										</h4>
										<div className="flex justify-between mt-1">
											<span className="text-xs">[{qna.productQnaTypeName}]</span>
											<div>
												{qna.answer && (
													<span className="px-1 py-0.5 text-xs text-blue-600 border rounded-sm border-spacing-3 bg-sky-200">
														답변완료
													</span>
												)}
												{qna.answerRead && (
													<span className="ml-1 px-1 py-0.5 text-xs text-orange-600 border rounded-sm border-spacing-3 bg-orange-200">
														답변읽음
													</span>
												)}
											</div>
										</div>
										<div className="px-1 mt-2 text-sm">
											<p
												dangerouslySetInnerHTML={{
													__html: qna.question.replace(/\n/g, "<br />"),
												}}
											></p>
										</div>
										{!qna.answer && (
											<div className="text-right">
												<button className="text-base" onClick={() => {}}>
													답변작성
												</button>
											</div>
										)}
									</div>
									{qnaAnswerForm.productQnaId === qna.productQnaId && (
										<>
											<hr />
											<div className="flex px-5 py-3 bg-blue-100">
												<div>ㄴ</div>
												<div className="w-full">
													{qna.answerRead ? (
														<>
															<p className="py-1.5 text-sm">{qna.answer}</p>
														</>
													) : (
														<div className="">
															<h4 className="text-xs">{qna.answer ? "답변 수정" : "답변 작성"}</h4>
															<textarea
																name="qnaContent"
																id="qnaContent"
																rows={3}
																className="w-full p-2 mt-1 border rounded-md resize-none"
																value={qnaAnswerForm.answer}
																onChange={(e) => {
																	setQnaAnswerForm((prev) => ({
																		...prev,
																		answer: e.target.value,
																	}));
																}}
																onBlur={(e) => {
																	setQnaAnswerForm((prev) => ({
																		...prev,
																		answer: e.target.value.trim(),
																	}));
																}}
															></textarea>
															<div className="mt-1 text-right">
																<button className="pr-2 text-base" onClick={handleUpdateQnaAnswer}>
																	{qna.answer ? "수정완료" : "답변완료"}
																</button>
															</div>
														</div>
													)}
												</div>
											</div>
										</>
									)}
								</div>
							);
						})}
					<div>
						<TurnToPagination
							curPage={qnaPage.page}
							totalPage={qnaPage.totalPage}
							turnPage={(page) => {
								setQnaPage((prev) => ({ ...prev, page }));
							}}
						/>
					</div>
				</section>
			</article>
		</div>
	);
}
