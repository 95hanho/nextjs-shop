import { FaQuestion } from "react-icons/fa";
import styles from "./Buy.module.scss";
import clsx from "clsx";
import { DeliveryMemoSelector } from "@/components/address/DeliveryMemoSelector";
import { useCallback, useEffect, useState } from "react";
import { useBuy } from "@/hooks/buy/useBuy";
import { useModalStore } from "@/store/modal.store";
import { OnOffButton } from "@/components/ui/OnOffButton";
import { FormInput } from "@/components/form/FormInput";
import { AddressSection } from "@/components/auth/AddressSection";

// interface ShippingAddressFormProps {}

export default function ShippingAddressForm() {
	const { openModal } = useModalStore();
	const {
		shippingMemo,
		shippingAddress,
		currentDefaultStatus,
		setAsDefault,
		setSetAsDefault,
		shippingAddressMode,
		setShippingAddressMode,
		newAddress,
		changeNewAddress,
		validateNewAddress,
		addressAlarm,
		addressFormInputRefs,
	} = useBuy();

	const isModeExisting = shippingAddressMode === "existing";
	const inputAddress = isModeExisting ? shippingAddress : newAddress;

	// ----------------------------------------------------------------
	// React
	// ----------------------------------------------------------------

	const [memoDirectInput, setMemoDirectInput] = useState(false); // 직접입력 show
	const handleChangeMemo = useCallback(
		(memo: string, directInput: boolean) => {
			changeNewAddress(undefined, { memo });
			setMemoDirectInput(directInput);
		},
		[changeNewAddress],
	);

	// ----------------------------------------------------------------
	// useEffect & useMemo
	// ----------------------------------------------------------------

	useEffect(() => {
		setSetAsDefault(false);
	}, [shippingAddressMode, setSetAsDefault]);

	return (
		<article className={styles.block}>
			<header className={styles.blockHeader}>
				<div className={styles.blockTitleRow}>
					<div className={styles.blockTitle}>
						<span>배송 정보</span>
						<i className={styles.iconCircle}>
							<FaQuestion />
						</i>
					</div>

					<div className={styles.requiredInfo}>
						<mark className={styles.requiredMark}>*</mark>
						<span>표시는 필수입력 항목</span>
					</div>
				</div>

				<nav className={styles.tabs}>
					<div>
						{shippingAddress && (
							<button
								type="button"
								className={`${styles.tab} ${isModeExisting ? styles.active : ""}`}
								onClick={() => setShippingAddressMode("existing")}
							>
								기존 배송지
							</button>
						)}
						<button
							type="button"
							className={`${styles.tab} ${!isModeExisting ? styles.active : ""}`}
							onClick={() => setShippingAddressMode("new")}
						>
							신규입력
						</button>
					</div>
					{shippingAddressMode === "existing" && (
						<div className={styles.addresslist}>
							<button
								className={styles.addresslistBtn}
								onClick={() => {
									openModal("BUY_ADDRESSLIST", {});
								}}
							>
								이전 배송지 목록
							</button>
						</div>
					)}
				</nav>
			</header>

			<div className={styles.form}>
				<div className="mt-2 mb-1 text-right ">
					{(!currentDefaultStatus || !inputAddress?.addressId) && (
						<OnOffButton
							text="기본 배송지로"
							checked={setAsDefault}
							name="buyDefaultAddress"
							size="sm"
							onChange={() => setSetAsDefault((prev) => !prev)}
						/>
					)}
				</div>
				{/* row */}
				<FormInput
					name="addressName"
					label="배송지명"
					placeholder="배송지 이름을 입력해주세요."
					type="text"
					alarm={addressAlarm}
					value={inputAddress?.addressName || ""}
					onChange={changeNewAddress}
					onBlur={validateNewAddress}
					requiredMark={true}
					readOnly={isModeExisting}
					labelWidthPercent={28}
					inputWidthPercent={80}
					ref={(el) => {
						addressFormInputRefs.current.addressName = el;
					}}
				/>

				<FormInput
					name="recipientName"
					label="수령인"
					placeholder="수령인 이름을 입력해주세요."
					type="text"
					alarm={addressAlarm}
					value={inputAddress?.recipientName || ""}
					onChange={changeNewAddress}
					onBlur={validateNewAddress}
					requiredMark={true}
					readOnly={isModeExisting}
					labelWidthPercent={28}
					inputWidthPercent={80}
					ref={(el) => {
						addressFormInputRefs.current.recipientName = el;
					}}
				/>
				<AddressSection
					form={{
						zonecode: inputAddress?.zonecode || "",
						address: inputAddress?.address || "",
						addressDetail: inputAddress?.addressDetail || "",
					}}
					alarm={addressAlarm}
					handleKakaoAddress={(result) => {
						changeNewAddress(undefined, {
							zonecode: result.zonecode,
							address: result.address,
						});
					}}
					changeForm={changeNewAddress}
					validateForm={validateNewAddress}
					refs={{
						zonecode(el) {
							addressFormInputRefs.current.zonecode = el;
						},
						address(el) {
							addressFormInputRefs.current.address = el;
						},
						addressDetail(el) {
							addressFormInputRefs.current.addressDetail = el;
						},
					}}
					requiredMark={true}
					addressDetailReadOnly={isModeExisting}
					labelWidthPercent={28}
					inputWidthPercent={80}
				/>
				<FormInput
					name="addressPhone"
					label="연락처"
					placeholder="연락처를 입력해주세요."
					type="text"
					alarm={addressAlarm}
					value={inputAddress?.addressPhone || ""}
					onChange={changeNewAddress}
					onBlur={validateNewAddress}
					requiredMark={true}
					maxLength={11}
					readOnly={isModeExisting}
					labelWidthPercent={28}
					inputWidthPercent={80}
					ref={(el) => {
						addressFormInputRefs.current.addressPhone = el;
					}}
				/>

				<div className={styles.formRow}>
					<div className={styles.formLabel}>
						메모<mark className={styles.requiredMark}>*</mark>
					</div>
					<div className={styles.formField}>
						<div>
							{/* 배송 메모 셀렉터 자리 */}
							<div className={styles.selectRow}>
								<DeliveryMemoSelector keyName="buyShippingMemo" shippingMemo={shippingMemo} changeMemo={handleChangeMemo} />
							</div>
							{memoDirectInput && (
								<div className="mt-2">
									<input
										className={clsx(styles.input)}
										type="text"
										name="memo"
										value={newAddress.memo || ""}
										onChange={changeNewAddress}
										onBlur={validateNewAddress}
										ref={(el) => {
											addressFormInputRefs.current.memo = el;
										}}
									/>
								</div>
							)}

							{addressAlarm?.name === "memo" && addressAlarm.status === "FAIL" && (
								<p className="px-3 my-2 text-[#f00] font-bold">* {addressAlarm.message}</p>
							)}

							<p className={styles.helperText}>기본 배송지입니다. 주문 시 변경하신 내용으로 기본 배송지 주소가 수정됩니다.</p>
						</div>
					</div>
				</div>
			</div>
		</article>
	);
}
