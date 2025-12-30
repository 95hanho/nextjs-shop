"use client";

import { useEffect, useRef, useState } from "react";
import { BsXLg } from "react-icons/bs";
import OptionSelector from "../ui/OptionSelector";
import { UserAddressListItem } from "@/types/mypage";
import { useModalStore } from "@/store/modal.store";
import JoinInput from "../user/JoinInput";
import { ChangeEvent, FormEvent } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/api/fetchFilter";

interface AddressUpdateModalProps {
	onClose: () => void;
	address: UserAddressListItem;
}
type UpdateAddress = {
	addressName: string;
	recipientName: string;
	addressPhone: string;
	address: string;
	addressDetail: string;
	memo: string;
};
type UpdateAddressFormRefs = {
	addressName: HTMLInputElement | null;
	recipientName: HTMLInputElement | null;
	addressPhone: HTMLInputElement | null;
	address: HTMLInputElement | null;
	addressDetail: HTMLInputElement | null;
	memo: HTMLInputElement | null;
};

const initUpdatedAddressAlert = {
	addressName: "",
	recipientName: "",
	addressPhone: "",
	address: "",
	addressDetail: "",
	memo: "",
};

const updatedAddressFormRegex: { [key: string]: RegExp } = {
	addressPhone: /^(010|011|016|017|018|019)\d{3,4}\d{4}$/,
};
const updatedAddressFormRegexFailMent: { [key: string]: string } = {
	addressPhone: "휴대폰 번호 형식에 일치하지 않습니다.",
};

export default function AddressUpdateModal({ onClose, address }: AddressUpdateModalProps) {
	const { resolveModal } = useModalStore();

	const [updatedAddress, setUpdatedAddress] = useState<UserAddressListItem>(address);
	const changeUpdatedAddress = (e: ChangeEvent) => {
		let { name, value } = e.target as {
			name: keyof UserAddressListItem;
			value: string;
		};
		setUpdatedAddressFailAlert(() => ({
			...initUpdatedAddressAlert,
		}));
		setUpdatedAddress((prev) => ({
			...prev,
			[name]: value,
		}));
	};
	const [updatedAddressFailAlert, setUpdatedAddressFailAlert] = useState(initUpdatedAddressAlert);
	const updatedAddressFormRefs = useRef<Partial<UpdateAddressFormRefs>>({});
	const [memoPickidx, setMemoPickidx] = useState(0);
	const [memoOptionInit, setMemoOptionInit] = useState({
		id: 1,
		val: "문 앞에 놓아주세요",
	});
	const memoOptionList = [
		{ id: 1, val: "문 앞에 놓아주세요" },
		{ id: 2, val: "경비실에 맡겨주세요" },
		{ id: 3, val: "부재 시 전화 주세요" },
		{ id: 4, val: "배송 전 연락 바랍니다" },
		{ id: 5, val: "직접 입력" },
	];
	// 유효성 확인 ex) 정규표현식 확인
	const validateUpdatedAddressForm = async (e: ChangeEvent) => {
		let { name, value } = e.target as {
			name: keyof UserAddressListItem;
			value: string;
		};
		value = value.trim();
		let failMent = "";
		let successMent = "";
		if (updatedAddressFormRegex[name] && value) {
			if (!updatedAddressFormRegex[name].test(value)) {
				failMent = updatedAddressFormRegexFailMent[name];
			}
		}
		if (failMent) {
			setUpdatedAddressFailAlert((prev) => ({
				...prev,
				[name]: failMent,
			}));
		}
		setUpdatedAddress((prev) => ({
			...prev,
			[name]: value,
		}));
	};
	const addressUpdateSubmit = (e: FormEvent) => {
		console.log("addressUpdateSubmit");
		e.preventDefault();

		let alertOn = "";
		const alertKeys = Object.keys(initUpdatedAddressAlert) as (keyof UpdateAddress)[];

		for (const key of alertKeys) {
			// for (let i = 0; i < keys.length; i++) {
			// const key = keys[i];
			const value = updatedAddress[key];
			alertOn = updatedAddressFailAlert[key];
			// 알람없을 때 처음 누를 때
			if (!alertOn) {
				if (!value) {
					alertOn = "해당 내용을 입력해주세요.";
				}
			}
			// 알람있을 때 또 눌렀으면
			if (alertOn) {
				setUpdatedAddressFailAlert((prev) => ({
					...prev,
					[key]: alertOn,
				}));
				updatedAddressFormRefs.current[key]?.focus();
				break;
			}
		}
		console.log(alertOn);
		if (alertOn) return;
		console.log("ADDRESS_UPDATE - SUCCESS");
		return;
		resolveModal({
			action: "ADDRESS_UPDATE",
			payload: updatedAddress,
		});
	};
	/* -------------------- */
	// 주소API 팝업 띄우기
	const addressPopup = () => {
		new window.daum.Postcode({
			oncomplete: (data) => {
				if (!data) return;
				const fullAddress = data.roadAddress || data.jibunAddress;
				setUpdatedAddress((prev) => {
					const updated = prev as UserAddressListItem;
					return {
						...updated,
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
			setUpdatedAddress({
				...address,
			});
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

	if (!updatedAddress) return null;
	return (
		<div id="addressUpdateModal" className="modal-wrap">
			<header className="modal-header">배송지 수정</header>
			<button className="modal-close" onClick={onClose}>
				<BsXLg />
			</button>
			{/*  */}
			<div className="modal-content address">
				<form onSubmit={addressUpdateSubmit}>
					<div className="address-input">
						<JoinInput
							name="addressName"
							label="배송지 이름"
							placeholder="배송지 이름을 입력해주세요."
							value={updatedAddress.addressName}
							onChange={changeUpdatedAddress}
							onBlur={validateUpdatedAddressForm}
							failMessage={updatedAddressFailAlert.addressName}
							ref={(el) => {
								updatedAddressFormRefs.current.addressName = el;
							}}
						/>
						<JoinInput
							name="recipientName"
							label="수령인"
							placeholder="수령인을 입력해주세요."
							value={updatedAddress.recipientName}
							onChange={changeUpdatedAddress}
							onBlur={validateUpdatedAddressForm}
							failMessage={updatedAddressFailAlert.recipientName}
							ref={(el) => {
								updatedAddressFormRefs.current.recipientName = el;
							}}
						/>
						<JoinInput
							type="tel"
							name="addressPhone"
							label="수령인 전화번호"
							placeholder="전화번호를 입력해주세요."
							value={updatedAddress.addressPhone}
							onChange={changeUpdatedAddress}
							onBlur={validateUpdatedAddressForm}
							failMessage={updatedAddressFailAlert.addressPhone}
							inputMode="numeric"
							pattern="[0-9]*"
							maxLength={11}
							ref={(el) => {
								updatedAddressFormRefs.current.addressPhone = el;
							}}
						/>
						<JoinInput
							name="address"
							label="주소"
							placeholder="주소를 입력해주세요."
							value={updatedAddress.address}
							failMessage={updatedAddressFailAlert.address}
							readOnly
							onClick={addressPopup}
							searchBtn={{ txt: "검색", fnc: addressPopup }}
						/>
						<JoinInput
							name="addressDetail"
							label="상세주소"
							placeholder="상세주소를 입력해주세요."
							value={updatedAddress.addressDetail}
							failMessage={updatedAddressFailAlert.addressDetail}
							onChange={changeUpdatedAddress}
							onBlur={validateUpdatedAddressForm}
							ref={(el) => {
								updatedAddressFormRefs.current.addressDetail = el;
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
										setUpdatedAddress((prev) => ({
											...prev,
											memo,
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
									value={updatedAddress.memo}
									failMessage={updatedAddressFailAlert.memo}
									onChange={changeUpdatedAddress}
									onBlur={validateUpdatedAddressForm}
									ref={(el) => {
										updatedAddressFormRefs.current.memo = el;
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
							변경하기
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
