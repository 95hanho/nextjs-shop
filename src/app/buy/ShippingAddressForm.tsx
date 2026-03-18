import { FaQuestion } from "react-icons/fa";
import styles from "./BuyClient.module.scss";
import clsx from "clsx";
import { DeliveryMemoSelector } from "@/components/address/DeliveryMemoSelector";
import { useCallback, useState } from "react";
import { useBuy } from "@/hooks/buy/useBuy";

// interface ShippingAddressFormProps {}

export default function ShippingAddressForm() {
	const { initMemo, defaultAddress, shippingAddressMode, setShippingAddressMode, newAddress, changeNewAddress } = useBuy();

	const isModeExisting = shippingAddressMode === "existing";
	const inputAddress = isModeExisting ? defaultAddress : newAddress;

	const [memoDirectInput, setMemoDirectInput] = useState(false); // 직접입력 show
	const handleChangeMemo = useCallback(
		(memo: string, directInput: boolean) => {
			console.log("memo", memo);
			changeNewAddress(undefined, { name: "memo", value: memo });
			setMemoDirectInput(directInput);
		},
		[changeNewAddress],
	);

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
						{defaultAddress && (
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
					<div className={styles.addresslist}>
						<button className={styles.addresslistBtn}>이전 배송지 목록</button>
					</div>
				</nav>
			</header>

			<div className={styles.form}>
				{/* row */}
				<div className={styles.formRow}>
					<div className={styles.formLabel}>배송지명</div>
					<div className={styles.formField}>
						<div className={styles.inlineBetween}>
							<input
								className={clsx(styles.input)}
								type="text"
								name="addressName"
								disabled={isModeExisting}
								value={inputAddress?.addressName || ""}
								onChange={changeNewAddress}
							/>
						</div>
					</div>
				</div>

				<div className={styles.formRow}>
					<div className={styles.formLabel}>
						수령인 <mark className={styles.requiredMark}>*</mark>
					</div>
					<div className={styles.formField}>
						<input
							className={styles.input}
							type="text"
							name="recipientName"
							value={inputAddress?.recipientName || ""}
							onChange={changeNewAddress}
							disabled={isModeExisting}
						/>
					</div>
				</div>

				<div className={styles.formRow}>
					<div className={styles.formLabel}>
						배송지 <mark className={styles.requiredMark}>*</mark>
					</div>

					<div className={styles.formField}>
						<div className={styles.addressGroup}>
							<div className={styles.addressTop}>
								<div className={clsx(styles.postcode, { [styles.disabled]: isModeExisting })}>{inputAddress?.zonecode || ""}</div>
								{!isModeExisting && (
									<button type="button" className={styles.grayBtn}>
										우편번호 검색
									</button>
								)}
							</div>

							<div className={clsx(styles.addressLine, { [styles.disabled]: isModeExisting })}>{inputAddress?.address || ""}</div>
							<input
								className={styles.input}
								type="text"
								name="addressDetail"
								value={inputAddress?.addressDetail || ""}
								onChange={changeNewAddress}
								disabled={isModeExisting}
							/>
						</div>
					</div>
				</div>

				<div className={styles.formRow}>
					<div className={styles.formLabel}>
						연락처 <mark className={styles.requiredMark}>*</mark>
					</div>
					<div className={styles.formField}>
						<div className={styles.phoneGroup}>
							<input
								className={styles.input}
								type="tel"
								maxLength={11}
								disabled={isModeExisting}
								placeholder="휴대폰번호를 입력해주세요."
								value={inputAddress?.addressPhone || ""}
								onChange={changeNewAddress}
							/>
						</div>
					</div>
				</div>

				<div className={styles.formRow}>
					<div className={styles.formLabel}>메모</div>
					<div className={styles.formField}>
						{/* 배송 메모 셀렉터 자리 */}
						<div className={styles.selectRow}>
							<DeliveryMemoSelector keyName="buyShippingMemo" initMemo={initMemo} changeMemo={handleChangeMemo} />
						</div>
						{memoDirectInput && (
							<div className="mt-2">
								<input
									className={clsx(styles.input)}
									type="text"
									name="memo"
									value={newAddress.memo || ""}
									onChange={changeNewAddress}
								/>
							</div>
						)}

						<p className={styles.helperText}>기본 배송지입니다. 주문 시 변경하신 내용으로 기본 배송지 주소가 수정됩니다.</p>
					</div>
				</div>
			</div>
		</article>
	);
}
