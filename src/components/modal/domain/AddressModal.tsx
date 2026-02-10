import { useEffect, useRef, useState } from "react";
import { OptionSelector } from "../../ui/OptionSelector";
import { UserAddressListItem } from "@/types/mypage";
import { useModalStore } from "@/store/modal.store";
import { ModalFrame } from "@/components/modal/frame/ModalFrame";
import styles from "../Modal.module.scss";
import { ChangeEvent, FormEvent } from "@/types/event";
import { FormInput } from "@/components/auth/FormInput";
import { FormInputAlarm, FormInputRefs } from "@/types/form";
import { AddressSection } from "@/components/auth/AddressSection";
import clsx from "clsx";

export type AddressForm = {
	addressName: string;
	recipientName: string;
	addressPhone: string;
	zonecode: string;
	address: string;
	addressDetail: string;
	memo: string;
};
type AddressFormInputKeys = keyof Omit<AddressForm, "zonecode">;
type AddressFormAlarm = FormInputAlarm<AddressFormInputKeys>;
type AddressFormFormInputRefs = FormInputRefs<AddressFormInputKeys>;

const memoOptionList = [
	{ id: 1, val: "문 앞에 놓아주세요" },
	{ id: 2, val: "경비실에 맡겨주세요" },
	{ id: 3, val: "부재 시 전화 주세요" },
	{ id: 4, val: "배송 전 연락 바랍니다" },
	{ id: 5, val: "직접 입력" },
];

const initAddressForm = {
	addressName: "",
	recipientName: "",
	addressPhone: "",
	zonecode: "",
	address: "",
	addressDetail: "",
	memo: "문 앞에 놓아주세요",
};

const addressFormRegex: { [key: string]: RegExp } = {
	addressPhone: /^(010|011|016|017|018|019)\d{3,4}\d{4}$/,
};
const addressFormRegexFailMent: { [key: string]: string } = {
	addressPhone: "휴대폰 번호 형식에 일치하지 않습니다.",
};

interface AddressModalProps {
	onClose: () => void;
	prevAddress?: UserAddressListItem;
}

export const AddressModal = ({ onClose, prevAddress }: AddressModalProps) => {
	const { resolveModal } = useModalStore();

	const [addressForm, setAddressForm] = useState<AddressForm>(initAddressForm);
	const [addressFormAlarm, setAddressFormAlarm] = useState<AddressFormAlarm | null>(null);
	const addressFormInputRefs = useRef<Partial<AddressFormFormInputRefs>>({});
	const [memoPickidx, setMemoPickidx] = useState(0);
	const [memoOptionInit, setMemoOptionInit] = useState(memoOptionList[0]);

	const changeAddressForm = (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: AddressFormInputKeys;
			value: string;
		};
		setAddressFormAlarm(null);
		setAddressForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};
	// 유효성 확인 ex) 정규표현식 확인
	const validateAddressForm = async (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: AddressFormInputKeys;
			value: string;
		};
		const changeVal = value.trim();
		let changeAlarm: AddressFormAlarm | null = null;

		if (!changeVal) return;
		if (changeVal) {
			if (addressFormRegex[name]) {
				if (!addressFormRegex[name].test(changeVal)) {
					changeAlarm = { name, message: addressFormRegexFailMent[name], status: "FAIL" };
				}
			}
		}
		setAddressFormAlarm(changeAlarm);
		setAddressForm((prev) => ({
			...prev,
			[name]: changeVal,
		}));
	};
	const addressSetSubmit = (e: FormEvent) => {
		console.log("addressSetSubmit");
		e.preventDefault();
		if (addressFormAlarm?.status === "FAIL") {
			addressFormInputRefs.current[addressFormAlarm.name]?.focus();
			return;
		}
		let changeAlarm: AddressFormAlarm | null = null;
		const alertKeys = Object.keys(addressForm) as AddressFormInputKeys[];
		for (const key of alertKeys) {
			if (!addressFormInputRefs.current[key]) continue;
			const value = addressForm[key];
			// 알람없을 때 처음 누를 때
			if (!value) {
				changeAlarm = { name: key, message: "해당 내용을 입력해주세요.", status: "FAIL" };
			}
			// 정규표현식 검사
			else if (addressFormRegex[key]) {
				if (!addressFormRegex[key].test(value)) {
					changeAlarm = { name: key, message: addressFormRegexFailMent[key], status: "FAIL" };
				}
			}
			if (changeAlarm) break;
		}
		if (changeAlarm) {
			setAddressFormAlarm(changeAlarm);
			return;
		}
		resolveModal({
			action: "ADDRESS_SET",
			payload: addressForm,
		});
	};
	/* -------------------- */
	// 처음 들어올 때
	useEffect(() => {
		if (prevAddress) {
			setAddressForm((prev) => ({
				...prev,
				addressName: prevAddress.addressName,
				recipientName: prevAddress.recipientName,
				addressPhone: prevAddress.addressPhone,
				zonecode: prevAddress.zonecode,
				address: prevAddress.address,
				addressDetail: prevAddress.addressDetail,
				memo: prevAddress.memo,
			}));
			const findIndex = memoOptionList.slice(0, 4).findIndex((v) => v.val === prevAddress.memo);
			if (findIndex === -1) {
				setMemoPickidx(4);
				setMemoOptionInit(memoOptionList[4]);
			} else {
				setMemoPickidx(findIndex);
				setMemoOptionInit(memoOptionList[findIndex]);
			}
		}
	}, [prevAddress]);

	if (!addressForm) return null;
	return (
		<ModalFrame title={!prevAddress ? "배송지 추가" : "배송지 수정"} onClose={onClose} contentVariant="address">
			<form onSubmit={addressSetSubmit}>
				<div className={styles.addressInput}>
					<FormInput
						name="addressName"
						label="배송지 이름"
						placeholder="배송지 이름을 입력해주세요."
						value={addressForm.addressName}
						onChange={changeAddressForm}
						onBlur={validateAddressForm}
						alarm={addressFormAlarm}
						ref={(el) => {
							addressFormInputRefs.current.addressName = el;
						}}
					/>
					<FormInput
						name="recipientName"
						label="수령인"
						placeholder="수령인을 입력해주세요."
						value={addressForm.recipientName}
						onChange={changeAddressForm}
						onBlur={validateAddressForm}
						alarm={addressFormAlarm}
						ref={(el) => {
							addressFormInputRefs.current.recipientName = el;
						}}
					/>
					<FormInput
						type="tel"
						name="addressPhone"
						label="수령인 전화번호"
						placeholder="전화번호를 입력해주세요."
						value={addressForm.addressPhone}
						onChange={changeAddressForm}
						onBlur={validateAddressForm}
						alarm={addressFormAlarm}
						inputMode="numeric"
						pattern="[0-9]*"
						maxLength={11}
						ref={(el) => {
							addressFormInputRefs.current.addressPhone = el;
						}}
					/>
					<AddressSection
						form={addressForm}
						alarm={addressFormAlarm}
						setAddress={(result) => {
							setAddressForm((prev) => ({
								...prev,
								zonecode: result.zonecode,
								address: result.address,
							}));
						}}
						changeForm={changeAddressForm}
						validateForm={validateAddressForm}
						setAddressRef={(el) => {
							addressFormInputRefs.current.address = el;
						}}
						setAddressDetailRef={(el) => {
							addressFormInputRefs.current.addressDetail = el;
						}}
					/>
				</div>
				{/* 위: 옵션 드롭다운 + 리스트 */}
				<div className={styles.optionBlock}>
					<div className={styles.optionMemo}>
						<span className={clsx(styles.title, "w-1/3")}>메모</span>
						<span className={clsx(styles.memoOption, "w-2/3")}>
							<OptionSelector
								optionSelectorName="deliveryMemo"
								pickIdx={memoPickidx}
								initData={memoOptionInit}
								optionList={memoOptionList}
								changeOption={(idx, id) => {
									setMemoPickidx(idx);
									let memo;
									if (id < 5) memo = memoOptionList[idx].val;
									else memo = "";
									setAddressForm((prev) => ({
										...prev,
										memo,
									}));
									setAddressFormAlarm(null);
								}}
								variant="addressModal"
							/>
						</span>
					</div>
					<div className={styles.addressWrite}>
						{memoPickidx === 4 && (
							<FormInput
								name="memo"
								label="직접입력"
								placeholder="메모를 입력해주세요."
								value={addressForm.memo}
								alarm={addressFormAlarm}
								onChange={changeAddressForm}
								onBlur={validateAddressForm}
								ref={(el) => {
									addressFormInputRefs.current.memo = el;
								}}
							/>
						)}
					</div>
				</div>
				{/* 버튼 */}
				<div className={styles.optionActions}>
					<button type="button" onClick={onClose}>
						취소
					</button>
					<button type="submit">{!prevAddress ? "완료" : "변경하기"}</button>
				</div>
			</form>
		</ModalFrame>
	);
};
