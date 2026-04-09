import { FormInput } from "@/components/form/FormInput";
import { InfoMark } from "@/components/form/InfoMark";
import { ModalFrame } from "@/components/modal/frame/ModalFrame";
import { ChangeEvent, FormEvent } from "@/types/event";
import { FormInputAlarm, FormInputRefs } from "@/types/form";
import { AddProductOptionBase, SellerProductOption, UpdateSellerProductOptionRequest } from "@/types/seller";
import { useEffect, useRef, useState } from "react";
import styles from "../Modal.module.scss";
import clsx from "clsx";
import { FaExchangeAlt } from "react-icons/fa";
import { money } from "@/lib/format";
import { useModalStore } from "@/store/modal.store";
import { useGlobalDialogStore } from "@/store/globalDialog.store";
import { DialogResultMap, DomainModalPropsMap } from "@/store/modal.type";

type SellerProductOptionModalProps = {
	onClose: () => void;
} & DomainModalPropsMap["SELLER_PRODUCT_OPTION"];

type OptionFormInputKeys = "addPrice" | "stock" | "size" /* | "displayed" */;
type OptionFormAlarm = FormInputAlarm<OptionFormInputKeys>;
type OptionFormInputRefs = FormInputRefs<OptionFormInputKeys>;

const initOptionForm: Partial<SellerProductOption> = {
	size: "",
	addPrice: 0,
	stock: 0,
};

export const SellerProductOptionModal = ({ onClose, prevSellerProductOption, productOptionSizeDuplicateList }: SellerProductOptionModalProps) => {
	const { openDialog, dialogResult, clearDialogResult } = useGlobalDialogStore();
	const { resolveModal } = useModalStore();

	// ------------------------------------------------
	// React
	// ------------------------------------------------

	// 옵션 입력값
	const [optionForm, setOptionForm] = useState<Partial<SellerProductOption>>(prevSellerProductOption || initOptionForm);
	const [optionFormAlarm, setOptionFormAlarm] = useState<OptionFormAlarm | null>(null);
	const optionFormInputRefs = useRef<Partial<OptionFormInputRefs>>({});

	// optionForm 변경
	const changeOptionForm = (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: OptionFormInputKeys;
			value: string;
		};
		let changeVal = value;
		// 숫자만 허용해야하는 input은 숫자만 입력받도록
		if (["addPrice", "stock"].includes(name)) {
			changeVal = changeVal.replace(/[^0-9]/g, "");
		}

		setOptionFormAlarm(null);
		setOptionForm((prev) => ({
			...prev,
			[name]: changeVal,
		}));
	};
	// 유효성 확인 ex) 정규표현식 확인
	const validateOptionForm = async (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: OptionFormInputKeys;
			value: string;
		};
		let changeVal = value.trim();
		let changeAlarm: OptionFormAlarm | null = null;

		// 사이즈 이름 중복 확인
		if (name === "size" && changeVal) {
			if (optionFormAlarm?.message !== "이미 존재하는 사이즈 이름입니다.") {
				if (productOptionSizeDuplicateList?.includes(changeVal)) {
					changeAlarm = { name: "size", message: "이미 존재하는 사이즈 이름입니다.", status: "FAIL" };
					optionFormInputRefs.current.size?.focus();
				}
			}
		}
		// 숫자만 허용해야하는 input은 숫자만 입력받도록
		if (["addPrice", "stock"].includes(name)) {
			changeVal = changeVal.replace(/[^0-9]/g, "");
			if (changeVal && Number(changeVal) < 0) {
				changeVal = "0";
			}
		}

		if (!changeVal) return;
		setOptionFormAlarm(changeAlarm);
		setOptionForm((prev) => ({
			...prev,
			[name]: changeVal,
		}));
	};
	// 옵션 등록/수정 제출
	const optionSetSubmit = (e: FormEvent) => {
		console.log("optionSetSubmit");
		e.preventDefault();
		// 알람이 있을 때는 해당 input으로 focus
		if (optionFormAlarm?.status === "FAIL") {
			optionFormInputRefs.current[optionFormAlarm.name]?.focus();
			return;
		}
		let changeAlarm: OptionFormAlarm | null = null;
		// const alertKeys = Object.keys(optionForm) as OptionFormInputKeys[];
		// for (const key of alertKeys) {
		// 	if (!optionFormInputRefs.current[key]) continue;
		// 	const value = optionForm[key];
		// 	// 알람없을 때 처음 누를 때
		// 	if (!value) {
		// 		changeAlarm = { name: key, message: "해당 내용을 입력해주세요.", status: "FAIL" };
		// 	}
		// 	if (changeAlarm) break;
		// }

		// 사이즈만 빈 값 확인
		if (optionForm.size === "") {
			changeAlarm = { name: "size", message: "사이즈를 입력해주세요.", status: "FAIL" };
		}

		if (changeAlarm) {
			setOptionFormAlarm(changeAlarm);
			optionFormInputRefs.current[changeAlarm.name]?.focus();
			return;
		}
		// productOptionId가 없으면 등록, 있으면 수정
		if (!optionForm.productOptionId) {
			const addProductOption: AddProductOptionBase = {
				addPrice: optionForm.addPrice,
				stock: optionForm.stock,
				size: optionForm.size,
			} as AddProductOptionBase;
			resolveModal({
				action: "SELLER_PRODUCT_OPTION_SET",
				payload: { addProductOption },
			});
		} else {
			const updateProductOption: UpdateSellerProductOptionRequest = {
				productOptionId: optionForm.productOptionId,
				addPrice: optionForm.addPrice,
				stock: optionForm.stock,
				isDisplayed: optionForm.displayed || false,
			} as UpdateSellerProductOptionRequest;
			resolveModal({
				action: "SELLER_PRODUCT_OPTION_SET",
				payload: { updateProductOption },
			});
		}
	};

	// ------------------------------------------------
	// useEffect, useMemo
	// ------------------------------------------------

	useEffect(() => {
		console.log({ prevSellerProductOption });
	}, [prevSellerProductOption]);

	// 모달 결과 처리
	useEffect(() => {
		if (!prevSellerProductOption || !dialogResult) return;

		// 옵션 상태 변경 후 처리
		if (dialogResult.action === "CONFIRM_OK") {
			const payload = dialogResult.payload as DialogResultMap["CONFIRM_OK"];
			if (payload?.result === "SELLER_PRODUCT_OPTION_DELETE_OK") {
				resolveModal({
					action: "SELLER_PRODUCT_OPTION_DELETE",
					payload: {
						productOptionId: prevSellerProductOption?.productOptionId,
					},
				});
			}
		}

		clearDialogResult();
	}, [clearDialogResult, dialogResult, prevSellerProductOption, resolveModal]);

	return (
		<ModalFrame title={!prevSellerProductOption ? "옵션 추가" : "옵션 수정"} onClose={onClose}>
			<form onSubmit={optionSetSubmit} className={clsx(styles.settingForm, styles.optionForm)}>
				{!prevSellerProductOption ? (
					<FormInput
						label="사이즈"
						name="size"
						value={optionForm.size || ""}
						placeholder="옵션 설명을 입력해주세요."
						alarm={optionFormAlarm}
						onChange={changeOptionForm}
						onBlur={validateOptionForm}
						ref={(el) => {
							optionFormInputRefs.current.size = el;
						}}
					/>
				) : (
					<InfoMark title="사이즈" infoVal={<span>{optionForm.size}</span>} />
				)}
				<FormInput
					label="추가 요금"
					name="addPrice"
					value={money(optionForm.addPrice || 0)}
					placeholder=""
					onChange={changeOptionForm}
					onBlur={validateOptionForm}
					alarm={optionFormAlarm}
					ref={(el) => {
						optionFormInputRefs.current.addPrice = el;
					}}
					unit="원"
				/>
				<FormInput
					label="재고 수량"
					type="number"
					name="stock"
					value={optionForm.stock || 0}
					placeholder=""
					onChange={changeOptionForm}
					onBlur={validateOptionForm}
					alarm={optionFormAlarm}
					ref={(el) => {
						optionFormInputRefs.current.stock = el;
					}}
				/>
				{prevSellerProductOption && (
					<>
						<InfoMark
							title="숨김 상태"
							infoVal={
								<span className={clsx(!optionForm.displayed && styles.off)}>
									{optionForm.displayed ? "표시" : "숨김"}
									<button
										type="button"
										className={clsx(styles.changeButton)}
										onClick={() => {
											setOptionForm({
												...optionForm,
												displayed: !optionForm.displayed,
											});
										}}
									>
										<FaExchangeAlt />
									</button>
								</span>
							}
						/>
						<InfoMark
							title="삭제"
							infoVal={
								<button
									type="button"
									className={styles.deleteButton}
									onClick={() => {
										openDialog("CONFIRM", {
											content: "옵션을 삭제하시겠습니까?",
											okResult: "SELLER_PRODUCT_OPTION_DELETE_OK",
										});
									}}
								>
									삭제하기
								</button>
							}
						/>
					</>
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
