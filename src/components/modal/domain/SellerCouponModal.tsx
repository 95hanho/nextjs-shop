import { FormInput } from "@/components/form/FormInput";
import { InfoMark } from "@/components/form/InfoMark";
import { ModalFrame } from "@/components/modal/frame/ModalFrame";
import { ChangeEvent, FormEvent } from "@/types/event";
import { FormInputAlarm, FormInputRefs } from "@/types/form";
import { AddCouponRequest, SellerCoupon, UpdateCouponRequest } from "@/types/seller";
import { useEffect, useRef, useState } from "react";
import styles from "../Modal.module.scss";
import clsx from "clsx";
import { FaExchangeAlt } from "react-icons/fa";
import { money } from "@/lib/format";
import { getNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";
import { useModalStore } from "@/store/modal.store";
import { DateInput } from "@/components/form/DateInput";
import DatePicker from "react-datepicker";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { DialogResultMap } from "@/store/modal.type";

interface SellerCouponModalProps {
	onClose: () => void;
	prevSellerCoupon?: SellerCoupon;
}

type CouponFormInputKeys = "description" | "discountValue" | "maxDiscount" | "minimumOrderBeforeAmount" | "amount";
type CouponFormAlarm = FormInputAlarm<CouponFormInputKeys | "startDate" | "endDate">;
type CouponFormInputRefs = FormInputRefs<CouponFormInputKeys> & {
	startDate: DatePicker | null;
	endDate: DatePicker | null;
};

const initCouponForm: Partial<SellerCoupon> = {
	description: "",
	discountType: "fixed_amount",
	discountValue: 1000,
	maxDiscount: null,
	minimumOrderBeforeAmount: 10000,
	isStackable: false,
	isProductRestricted: false,
	amount: 100,
	startDate: new Date().toISOString(),
	endDate: new Date().toISOString(),
	// issueMethod: "CLAIM",
};

export const SellerCouponModal = ({ onClose, prevSellerCoupon }: SellerCouponModalProps) => {
	const { openDialog, dialogResult, clearDialogResult } = useGlobalDialogStore();
	const { resolveModal } = useModalStore();

	// ------------------------------------------------
	// React
	// ------------------------------------------------

	// 쿠폰 입력값
	const [couponForm, setCouponForm] = useState<Partial<SellerCoupon>>(prevSellerCoupon || initCouponForm);
	const [couponFormAlarm, setCouponFormAlarm] = useState<CouponFormAlarm | null>(null);
	const couponFormInputRefs = useRef<Partial<CouponFormInputRefs>>({});

	// 알람이 있을 때 해당 input으로 focus | 날짜는 datepicker 열기
	const focusCouponField = (name: CouponFormInputKeys | "startDate" | "endDate", refs: React.MutableRefObject<Partial<CouponFormInputRefs>>) => {
		const target = refs.current[name];

		if (!target) return;

		if ("setFocus" in target) {
			target.setFocus();
			target.setOpen?.(true);
			return;
		}

		target.focus();
	};

	// couponForm 변경
	const changeCouponForm = (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: CouponFormInputKeys;
			value: string;
		};
		let changeVal = value;
		// 숫자만 허용해야하는 input은 숫자만 입력받도록
		if (["discountValue", "maxDiscount", "minimumOrderBeforeAmount", "amount"].includes(name)) {
			changeVal = changeVal.replace(/[^0-9]/g, "");
		}

		setCouponFormAlarm(null);
		setCouponForm((prev) => ({
			...prev,
			[name]: changeVal,
		}));
	};
	// 유효성 확인 ex) 정규표현식 확인
	const validateCouponForm = async (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: CouponFormInputKeys;
			value: string;
		};
		let changeVal = value.trim();
		let changeAlarm: CouponFormAlarm | null = null;

		// 쿠폰 이름 중복 확인
		if (name === "description" && changeVal) {
			if (couponFormAlarm?.message !== "이미 존재하는 쿠폰 이름입니다.") {
				await getNormal(getApiUrl(API_URL.SELLER_COUPON_DESCRIPTION_DUPLICATE), {
					description: changeVal,
				}).catch((err) => {
					if (err.message === "SELLER_COUPON_DESCRIPTION_DUPLICATED") {
						changeAlarm = { name: "description", message: "이미 존재하는 쿠폰 이름입니다.", status: "FAIL" };
						couponFormInputRefs.current.description?.focus();
					}
				});
			}
		}
		// 숫자만 허용해야하는 input은 숫자만 입력받도록
		if (["discountValue", "maxDiscount", "minimumOrderBeforeAmount", "amount"].includes(name)) {
			changeVal = changeVal.replace(/[^0-9]/g, "");
		}
		// 할인타입이 percentage일 때 discountValue는 100을 넘을 수 없음
		if (couponForm.discountType === "percentage") {
			if (name === "discountValue" && Number(changeVal) > 100) {
				changeVal = "100";
			}
		}

		if (!changeVal) return;
		if (changeVal) {
			// if (couponFormRegex[name]) {
			// 	if (!couponFormRegex[name].test(changeVal)) {
			// 		changeAlarm = { name, message: couponFormRegexFailMent[name], status: "FAIL" };
			// 	}
			// }
		}
		setCouponFormAlarm(changeAlarm);
		setCouponForm((prev) => ({
			...prev,
			[name]: changeVal,
		}));
	};
	// 쿠폰 등록/수정 제출
	const couponSetSubmit = (e: FormEvent) => {
		console.log("couponSetSubmit");
		e.preventDefault();
		// 알람이 있을 때는 해당 input으로 focus
		if (couponFormAlarm?.status === "FAIL") {
			focusCouponField(couponFormAlarm.name, couponFormInputRefs);
			return;
		}
		let changeAlarm: CouponFormAlarm | null = null;
		const alertKeys = Object.keys(couponForm) as CouponFormInputKeys[];
		for (const key of alertKeys) {
			if (!couponFormInputRefs.current[key]) continue;
			const value = couponForm[key];
			// 알람없을 때 처음 누를 때
			if (!value) {
				changeAlarm = { name: key, message: "해당 내용을 입력해주세요.", status: "FAIL" };
			}
			// 숫자값들은 0보다 커야함
			if (["discountValue", "maxDiscount", "minimumOrderBeforeAmount", "amount"].includes(key)) {
				if (Number(value) <= 0) {
					changeAlarm = { name: key, message: "값은 0보다 커야 합니다.", status: "FAIL" };
				}
			}
			if (changeAlarm) break;
		}
		// 최대 할인금액 < 최소 주문금액
		if (Number(couponForm.maxDiscount) > Number(couponForm.minimumOrderBeforeAmount)) {
			changeAlarm = { name: "maxDiscount", message: "최대 할인금액은 최소 주문금액보다 클 수 없습니다.", status: "FAIL" };
		}
		// 시작일 < 종료일
		if (couponForm.startDate && couponForm.endDate) {
			if (new Date(couponForm.startDate) >= new Date(couponForm.endDate)) {
				changeAlarm = { name: "endDate", message: "사용 시작일은 사용 종료일보다 이전이어야 합니다.", status: "FAIL" };
			}
		}
		if (changeAlarm) {
			setCouponFormAlarm(changeAlarm);
			focusCouponField(changeAlarm.name, couponFormInputRefs);
			return;
		}
		// couponId가 없으면 등록, 있으면 수정
		if (!couponForm.couponId) {
			const addCoupon: AddCouponRequest = {
				description: couponForm.description,
				discountType: couponForm.discountType,
				discountValue: couponForm.discountValue,
				maxDiscount: couponForm.maxDiscount,
				minimumOrderBeforeAmount: couponForm.minimumOrderBeforeAmount,
				isStackable: couponForm.isStackable,
				isProductRestricted: couponForm.isProductRestricted,
				amount: couponForm.amount,
				startDate: couponForm.startDate?.replace(/\//g, "-"),
				endDate: couponForm.endDate?.replace(/\//g, "-"),
			} as AddCouponRequest;
			resolveModal({
				action: "SELLER_COUPON_SET",
				payload: { addCoupon },
			});
		} else {
			const updateCoupon: UpdateCouponRequest = {
				couponId: couponForm.couponId,
				description: couponForm.description,
				discountType: couponForm.discountType,
				discountValue: couponForm.discountValue,
				maxDiscount: couponForm.maxDiscount,
				minimumOrderBeforeAmount: couponForm.minimumOrderBeforeAmount,
				status: couponForm.status,
				isStackable: couponForm.isStackable,
				isProductRestricted: couponForm.isProductRestricted,
				amount: couponForm.amount,
				startDate: couponForm.startDate?.replace(/\//g, "-"),
				endDate: couponForm.endDate?.replace(/\//g, "-"),
			} as UpdateCouponRequest;
			resolveModal({
				action: "SELLER_COUPON_SET",
				payload: { updateCoupon },
			});
		}
	};

	// ------------------------------------------------
	// useEffect, useMemo
	// ------------------------------------------------

	useEffect(() => {
		console.log({ prevSellerCoupon });
	}, [prevSellerCoupon]);

	// 모달 결과 처리
	useEffect(() => {
		if (!prevSellerCoupon || !dialogResult) return;

		// 쿠폰 상태 변경 후 처리
		if (dialogResult.action === "CONFIRM_OK") {
			const payload = dialogResult.payload as DialogResultMap["CONFIRM_OK"];
			if (payload?.result === "SELLER_COUPON_DELETE_OK") {
				resolveModal({
					action: "SELLER_COUPON_DELETE",
					payload: {
						couponId: prevSellerCoupon?.couponId,
					},
				});
			}
		}

		clearDialogResult();
	}, [clearDialogResult, dialogResult, prevSellerCoupon, resolveModal]);

	return (
		<ModalFrame title={!prevSellerCoupon ? "쿠폰 추가" : "쿠폰 수정"} onClose={onClose} contentVariant="coupon">
			<form onSubmit={couponSetSubmit} className={styles.couponForm}>
				{!prevSellerCoupon ? (
					<FormInput
						label="이름"
						name="description"
						value={couponForm.description || ""}
						placeholder="쿠폰 설명을 입력해주세요."
						alarm={couponFormAlarm}
						onChange={changeCouponForm}
						onBlur={validateCouponForm}
						ref={(el) => {
							couponFormInputRefs.current.description = el;
						}}
					/>
				) : (
					<InfoMark title="이름" infoVal={<span>{couponForm.description}</span>} />
				)}

				<InfoMark
					title="할인타입"
					infoVal={
						<span>
							{couponForm.discountType === "fixed_amount" ? "고정값" : "퍼센트"}
							<button
								type="button"
								className={clsx(styles.changeButton)}
								onClick={() => {
									setCouponForm({
										...couponForm,
										discountType: couponForm.discountType === "fixed_amount" ? "percentage" : "fixed_amount",
										discountValue: couponForm.discountType === "fixed_amount" ? 10 : 1000,
										maxDiscount: couponForm.discountType === "fixed_amount" ? 1000 : null,
									});
								}}
							>
								<FaExchangeAlt />
							</button>
						</span>
					}
				/>
				<FormInput
					type={couponForm.discountType === "fixed_amount" ? "text" : "number"}
					label="할인값"
					name="discountValue"
					value={(couponForm.discountType === "fixed_amount" ? money(couponForm.discountValue || 0) : couponForm.discountValue) || ""}
					placeholder=""
					onChange={changeCouponForm}
					onBlur={validateCouponForm}
					alarm={couponFormAlarm}
					ref={(el) => {
						couponFormInputRefs.current.discountValue = el;
					}}
					unit={couponForm.discountType === "fixed_amount" ? "원" : "%"}
					max={couponForm.discountType === "percentage" ? 100 : undefined}
				/>
				{couponForm.maxDiscount && (
					<FormInput
						label="최대 할인금액"
						name="maxDiscount"
						value={money(couponForm.maxDiscount)}
						placeholder=""
						onChange={changeCouponForm}
						onBlur={validateCouponForm}
						alarm={couponFormAlarm}
						ref={(el) => {
							couponFormInputRefs.current.maxDiscount = el;
						}}
						unit="원"
					/>
				)}
				<FormInput
					label="최소 주문금액"
					name="minimumOrderBeforeAmount"
					value={money(couponForm.minimumOrderBeforeAmount || "")}
					placeholder=""
					onChange={changeCouponForm}
					onBlur={validateCouponForm}
					alarm={couponFormAlarm}
					ref={(el) => {
						couponFormInputRefs.current.minimumOrderBeforeAmount = el;
					}}
					unit="원"
				/>
				{prevSellerCoupon && (
					<InfoMark
						title="상태"
						infoVal={
							<span className={clsx(couponForm.status === "SUSPENDED" && styles.off)}>
								{couponForm.status === "ACTIVE" ? "활성" : "비활성"}
								<button
									type="button"
									className={clsx(styles.changeButton)}
									onClick={() => {
										setCouponForm({
											...couponForm,
											status: couponForm.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
										});
									}}
								>
									<FaExchangeAlt />
								</button>
							</span>
						}
					/>
				)}
				<InfoMark
					title="중복가능여부"
					infoVal={
						<span className={clsx(!couponForm.isStackable && styles.off)}>
							{couponForm.isStackable ? "가능" : "불가"}
							{!prevSellerCoupon && (
								<button
									type="button"
									className={styles.changeButton}
									onClick={() => {
										setCouponForm({
											...couponForm,
											isStackable: !couponForm.isStackable,
										});
									}}
								>
									<FaExchangeAlt />
								</button>
							)}
						</span>
					}
				/>
				<InfoMark
					title="상품제한"
					infoVal={
						<span>
							{couponForm.isProductRestricted ? "가능" : "없음"}
							<button
								type="button"
								className={clsx(styles.changeButton)}
								onClick={() => {
									setCouponForm({
										...couponForm,
										isProductRestricted: !couponForm.isProductRestricted,
									});
								}}
							>
								<FaExchangeAlt />
							</button>
						</span>
					}
				/>
				<FormInput
					label="수량"
					type="number"
					name="amount"
					value={couponForm.amount || ""}
					placeholder=""
					onChange={changeCouponForm}
					onBlur={validateCouponForm}
					alarm={couponFormAlarm}
					ref={(el) => {
						couponFormInputRefs.current.amount = el;
					}}
				/>
				<DateInput
					name="startDate"
					label="사용 시작일"
					alarm={couponFormAlarm}
					selectedDate={couponForm.startDate ? new Date(couponForm.startDate) : null}
					changeDate={(date) => {
						setCouponFormAlarm(null);
						if (date) {
							setCouponForm({
								...couponForm,
								startDate: date.toISOString(),
							});
						}
					}}
					ref={(el) => {
						couponFormInputRefs.current.startDate = el;
					}}
				/>
				<DateInput
					name="endDate"
					label="사용 종료일"
					alarm={couponFormAlarm}
					selectedDate={couponForm.endDate ? new Date(couponForm.endDate) : null}
					changeDate={(date) => {
						setCouponFormAlarm(null);
						if (date) {
							setCouponForm({
								...couponForm,
								endDate: date.toISOString(),
							});
						}
					}}
					ref={(el) => {
						couponFormInputRefs.current.endDate = el;
					}}
				/>
				{prevSellerCoupon && (
					<InfoMark
						title="삭제"
						infoVal={
							<button
								type="button"
								className={styles.deleteButton}
								onClick={() => {
									openDialog("CONFIRM", {
										content: "쿠폰을 삭제하시겠습니까?",
										okResult: "SELLER_COUPON_DELETE_OK",
									});
								}}
							>
								삭제하기
							</button>
						}
					/>
				)}
				{/* 버튼 */}
				<div className={styles.optionActions}>
					<button type="button" onClick={onClose}>
						취소
					</button>
					<button type="submit">완료</button>
				</div>
			</form>
		</ModalFrame>
	);
};
