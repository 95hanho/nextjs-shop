"use client";

import { useEffect, useRef, useState } from "react";
import { BsXLg } from "react-icons/bs";
import OptionSelector from "../../ui/OptionSelector";
import { UserAddressListItem } from "@/types/mypage";
import { useModalStore } from "@/store/modal.store";
import JoinInput from "../../user/JoinInput";
import { ChangeEvent, FormEvent } from "@/types/auth";

interface AddressModalProps {
	onClose: () => void;
	address?: UserAddressListItem;
}

type AddressFormAlert = {
	addressName: string;
	recipientName: string;
	addressPhone: string;
	address: string;
	addressDetail: string;
	memo: string;
};
export type AddressForm = AddressFormAlert & {
	zonecode: string;
};
type AddressFormFormRefs = {
	addressName: HTMLInputElement | null;
	recipientName: HTMLInputElement | null;
	addressPhone: HTMLInputElement | null;
	address: HTMLInputElement | null;
	addressDetail: HTMLInputElement | null;
	memo: HTMLInputElement | null;
};

const memoOptionList = [
	{ id: 1, val: "문 앞에 놓아주세요" },
	{ id: 2, val: "경비실에 맡겨주세요" },
	{ id: 3, val: "부재 시 전화 주세요" },
	{ id: 4, val: "배송 전 연락 바랍니다" },
	{ id: 5, val: "직접 입력" },
];

const initAddressFormAlert = {
	addressName: "",
	recipientName: "",
	addressPhone: "",
	address: "",
	addressDetail: "",
	memo: "",
};
const initAddressForm = {
	...initAddressFormAlert,
	zonecode: "",
	memo: "문 앞에 놓아주세요",
};

const addressFormRegex: { [key: string]: RegExp } = {
	addressPhone: /^(010|011|016|017|018|019)\d{3,4}\d{4}$/,
};
const addressFormRegexFailMent: { [key: string]: string } = {
	addressPhone: "휴대폰 번호 형식에 일치하지 않습니다.",
};

export default function AddressModal({ onClose, address }: AddressModalProps) {
	const { resolveModal } = useModalStore();

	const [addressForm, setAddressForm] = useState<AddressForm>(initAddressForm);
	const changeAddressForm = (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: keyof AddressForm;
			value: string;
		};
		setAddressFormFailAlert(() => ({
			...initAddressFormAlert,
		}));
		setAddressForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};
	const [addressFormFailAlert, setAddressFormFailAlert] = useState<AddressFormAlert>(initAddressFormAlert);
	const addressFormRefs = useRef<Partial<AddressFormFormRefs>>({});
	const [memoPickidx, setMemoPickidx] = useState(0);
	const [memoOptionInit, setMemoOptionInit] = useState(memoOptionList[0]);

	// 유효성 확인 ex) 정규표현식 확인
	const validateAddressForm = async (e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: keyof AddressForm;
			value: string;
		};
		const trimValue = value.trim();
		let failMent = "";
		// const successMent = "";
		if (addressFormRegex[name] && trimValue) {
			if (!addressFormRegex[name].test(trimValue)) {
				failMent = addressFormRegexFailMent[name];
			}
		}
		if (failMent) {
			setAddressFormFailAlert((prev) => ({
				...prev,
				[name]: failMent,
			}));
		}
		setAddressForm((prev) => ({
			...prev,
			[name]: trimValue,
		}));
	};
	const addressSetSubmit = (e: FormEvent) => {
		console.log("addressSetSubmit");
		e.preventDefault();

		let alertOn = "";
		const alertKeys = Object.keys(initAddressFormAlert) as (keyof AddressFormAlert)[];

		for (const key of alertKeys) {
			// for (let i = 0; i < keys.length; i++) {
			// const key = keys[i];
			const value = addressForm[key];
			alertOn = addressFormFailAlert[key];
			// 알람없을 때 처음 누를 때
			if (!alertOn) {
				if (!value) {
					alertOn = "해당 내용을 입력해주세요.";
				}
			}
			// 알람있을 때 또 눌렀으면
			if (alertOn) {
				setAddressFormFailAlert((prev) => ({
					...prev,
					[key]: alertOn,
				}));
				addressFormRefs.current[key]?.focus();
				break;
			}
		}
		console.log(alertOn);
		if (alertOn) return;
		resolveModal({
			action: "ADDRESS_SET",
			payload: addressForm,
		});
	};
	/* -------------------- */
	// 주소API 팝업 띄우기
	const addressPopup = () => {
		new window.daum.Postcode({
			oncomplete: (data) => {
				if (!data) return;
				const fullAddress = data.roadAddress || data.jibunAddress;
				setAddressForm((prev) => {
					const address = prev as AddressForm;
					return {
						...address,
						zonecode: data.zonecode,
						address: fullAddress,
					};
				});
			},
		}).open({
			popupKey: "addpopup2",
		});
	};
	/* -------------------- */
	// 처음 들어올 때
	useEffect(() => {
		if (address) {
			setAddressForm((prev) => ({
				...prev,
				addressName: address.addressName,
				recipientName: address.recipientName,
				addressPhone: address.addressPhone,
				zonecode: address.zonecode,
				address: address.address,
				addressDetail: address.addressDetail,
				memo: address.memo,
			}));
			const findIndex = memoOptionList.slice(0, 4).findIndex((v) => v.val === address.memo);
			if (findIndex === -1) {
				setMemoPickidx(4);
				setMemoOptionInit(memoOptionList[4]);
			} else {
				setMemoPickidx(findIndex);
				setMemoOptionInit(memoOptionList[findIndex]);
			}
		}
	}, [address]);

	if (!addressForm) return null;
	return (
		<div id="addressModal" className="modal-wrap">
			<header className="modal-header">{!address ? "배송지 추가" : "배송지 수정"}</header>
			<button className="modal-close" onClick={onClose}>
				<BsXLg />
			</button>
			{/*  */}
			<div className="modal-content address">
				<form onSubmit={addressSetSubmit}>
					<div className="address-input">
						<JoinInput
							name="addressName"
							label="배송지 이름"
							placeholder="배송지 이름을 입력해주세요."
							value={addressForm.addressName}
							onChange={changeAddressForm}
							onBlur={validateAddressForm}
							failMessage={addressFormFailAlert.addressName}
							ref={(el) => {
								addressFormRefs.current.addressName = el;
							}}
						/>
						<JoinInput
							name="recipientName"
							label="수령인"
							placeholder="수령인을 입력해주세요."
							value={addressForm.recipientName}
							onChange={changeAddressForm}
							onBlur={validateAddressForm}
							failMessage={addressFormFailAlert.recipientName}
							ref={(el) => {
								addressFormRefs.current.recipientName = el;
							}}
						/>
						<JoinInput
							type="tel"
							name="addressPhone"
							label="수령인 전화번호"
							placeholder="전화번호를 입력해주세요."
							value={addressForm.addressPhone}
							onChange={changeAddressForm}
							onBlur={validateAddressForm}
							failMessage={addressFormFailAlert.addressPhone}
							inputMode="numeric"
							pattern="[0-9]*"
							maxLength={11}
							ref={(el) => {
								addressFormRefs.current.addressPhone = el;
							}}
						/>
						<JoinInput
							name="address"
							label="주소"
							placeholder="주소를 입력해주세요."
							value={addressForm.address}
							failMessage={addressFormFailAlert.address}
							readOnly
							onClick={addressPopup}
							searchBtn={{ txt: "검색", fnc: addressPopup }}
						/>
						<JoinInput
							name="addressDetail"
							label="상세주소"
							placeholder="상세주소를 입력해주세요."
							value={addressForm.addressDetail}
							failMessage={addressFormFailAlert.addressDetail}
							onChange={changeAddressForm}
							onBlur={validateAddressForm}
							ref={(el) => {
								addressFormRefs.current.addressDetail = el;
							}}
						/>
					</div>
					{/* 위: 옵션 드롭다운 + 리스트 */}
					<div className="option-block">
						<div className="option-memo">
							<span className="title">메모</span>
							<span className="memo-option">
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
										setAddressFormFailAlert((prev) => ({
											...prev,
											memo: "",
										}));
									}}
								/>
							</span>
						</div>
						<div className="address-write">
							{memoPickidx === 4 && (
								<JoinInput
									name="memo"
									label="직접입력"
									placeholder="메모를 입력해주세요."
									value={addressForm.memo}
									failMessage={addressFormFailAlert.memo}
									onChange={changeAddressForm}
									onBlur={validateAddressForm}
									ref={(el) => {
										addressFormRefs.current.memo = el;
									}}
								/>
							)}
						</div>
					</div>
					{/* 버튼 */}
					<div className="option-actions">
						<button type="button" className="option-actions__cancel" onClick={onClose}>
							취소
						</button>
						<button type="submit" className={`option-actions__submit`}>
							{!address ? "완료" : "변경하기"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
