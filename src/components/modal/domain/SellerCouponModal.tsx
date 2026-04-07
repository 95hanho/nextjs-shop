import { FormInput } from "@/components/auth/FormInput";
import { InfoMark } from "@/components/auth/InfoMark";
import { ModalFrame } from "@/components/modal/frame/ModalFrame";
import { ChangeEvent, FormEvent } from "@/types/event";
import { FormInputAlarm, FormInputRefs } from "@/types/form";
import { SellerCoupon } from "@/types/seller";
import { useEffect, useRef, useState } from "react";
import styles from "../Modal.module.scss";
import clsx from "clsx";
import { FaExchangeAlt } from "react-icons/fa";
import { money } from "@/lib/format";
import { getNormal } from "@/api/fetchFilter";
import { getApiUrl } from "@/lib/getBaseUrl";
import API_URL from "@/api/endpoints";

interface SellerCouponModalProps {
	onClose: () => void;
	prevSellerCoupon?: SellerCoupon;
}

type CouponFormInputKeys = "description" | "discountValue" | "maxDiscount" | "minimumOrderBeforeAmount" | "amount";
type CouponFormAlarm = FormInputAlarm<CouponFormInputKeys>;
type CouponFormInputRefs = FormInputRefs<CouponFormInputKeys>;

const initCouponForm: SellerCoupon = {
	couponId: 0,
	description: "",
	discountType: "fixed_amount",
	discountValue: 1000,
	maxDiscount: null,
	minimumOrderBeforeAmount: 10000,
	status: "ACTIVE",
	isStackable: false,
	isProductRestricted: false,
	amount: 0,
	usedCount: 0,
	startDate: new Date().toISOString(),
	endDate: new Date().toISOString(),
	issueMethod: "CLAIM",
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
};

export const SellerCouponModal = ({ onClose, prevSellerCoupon }: SellerCouponModalProps) => {
	// ------------------------------------------------
	// React
	// ------------------------------------------------

	// 쿠폰 입력값
	const [couponForm, setCouponForm] = useState<SellerCoupon>(prevSellerCoupon || initCouponForm);
	const [couponFormAlarm, setCouponFormAlarm] = useState<CouponFormAlarm | null>(null);
	const couponFormInputRefs = useRef<Partial<CouponFormInputRefs>>({});

	const changeCouponForm = (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: CouponFormInputKeys;
			value: string;
		};
		let changeVal = value.trim();
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
		if (name === "description") {
			console.log("쿠폰 이름 중복 확인");
			await getNormal(getApiUrl(API_URL.SELLER_COUPON_DESCRIPTION_DUPLICATE), {
				description: changeVal,
			}).catch((err) => {
				console.log(err);
				changeAlarm = { name: "description", message: "이미 존재하는 쿠폰 이름입니다.", status: "FAIL" };
				couponFormInputRefs.current.description?.focus();
			});
		}

		// 숫자만 허용해야하는 input은 숫자만 입력받도록
		if (["discountValue", "maxDiscount", "minimumOrderBeforeAmount", "amount"].includes(name)) {
			changeVal = changeVal.replace(/[^0-9]/g, "");
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
	const couponSetSubmit = (e: FormEvent) => {
		console.log("couponSetSubmit");
		e.preventDefault();
		if (couponFormAlarm?.status === "FAIL") {
			couponFormInputRefs.current[couponFormAlarm.name]?.focus();
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
			if (changeAlarm) break;
		}
		if (changeAlarm) {
			setCouponFormAlarm(changeAlarm);
			return;
		}
		console.log({
			couponForm,
		});
	};

	return (
		<ModalFrame title={!prevSellerCoupon ? "쿠폰 추가" : "쿠폰 수정"} onClose={onClose} contentVariant="coupon">
			<form onSubmit={couponSetSubmit} className={styles.couponForm}>
				{!prevSellerCoupon ? (
					<FormInput
						label="이름"
						name="description"
						value={couponForm.description}
						placeholder="쿠폰 설명을 입력해주세요."
						alarm={couponFormAlarm}
						onChange={changeCouponForm}
						onBlur={validateCouponForm}
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
								className={clsx(styles.button)}
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
					label="할인값"
					name="discountValue"
					value={couponForm.discountValue}
					placeholder=""
					onChange={changeCouponForm}
					onBlur={validateCouponForm}
					ref={(el) => {
						couponFormInputRefs.current.discountValue = el;
					}}
					unit={couponForm.discountType === "fixed_amount" ? "원" : "%"}
				/>
				{couponForm.maxDiscount && (
					<FormInput
						label="최대 할인금액"
						name="maxDiscount"
						value={money(couponForm.maxDiscount)}
						placeholder=""
						onChange={changeCouponForm}
						onBlur={validateCouponForm}
						ref={(el) => {
							couponFormInputRefs.current.maxDiscount = el;
						}}
						unit="원"
					/>
				)}
				<FormInput
					label="최소 주문금액"
					name="minimumOrderBeforeAmount"
					value={money(couponForm.minimumOrderBeforeAmount)}
					placeholder=""
					onChange={changeCouponForm}
					onBlur={validateCouponForm}
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
									className={clsx(styles.button)}
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
									className={styles.button}
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
								className={clsx(styles.button)}
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
					value={couponForm.amount}
					placeholder=""
					onChange={changeCouponForm}
					onBlur={validateCouponForm}
					ref={(el) => {
						couponFormInputRefs.current.amount = el;
					}}
				/>
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
