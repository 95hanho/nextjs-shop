import { useModalStore } from "@/store/modal.store";
import styles from "./ShippingAddressList.module.scss";
import { UserAddressListItem } from "@/types/mypage";
import clsx from "clsx";

type ShippingAddressListProps = { userAddressList: UserAddressListItem[] | [] } & (
	| {
			page: "MYPAGE";
			changeAddress: (address: UserAddressListItem) => void;
	  }
	| {
			page: "BUY";
	  }
);

export const ShippingAddressList = (props: ShippingAddressListProps) => {
	const { openModal, resolveModal } = useModalStore();

	return (
		<ul className={styles.addressList}>
			{props.userAddressList.map((userAddress) => (
				<li
					key={"userAddress" + userAddress.addressId}
					className="relative p-3 border-solid border-gray-400 bg-[#f5f5f5] rounded-[8px] mt-2 border-w border-[2px]"
				>
					{props.page === "BUY" && (
						<button
							className={styles.buyButton}
							onClick={() => {
								resolveModal({
									action: "BUY_ADDRESS_CHANGE",
									payload: userAddress,
								});
							}}
						></button>
					)}

					<h3 className={clsx(styles.addressHeader, "relative pt-[7px] pb-[2px] text-left flex justify-between")}>
						<span className={clsx(styles.addressName, "inline-block pl-3")}>{userAddress.addressName}</span>
						{userAddress.defaultAddress && <span className={styles.defaultMark}>기본배송지</span>}
					</h3>

					<div className={styles.addressBody}>
						{/* 공통 주소 정보 */}
						<div className={styles.row}>
							<span className={styles.label}>수령인정보</span>
							<span className={styles.value}>
								{userAddress.recipientName} / {userAddress.addressPhone}
							</span>
						</div>
						<div className={styles.row}>
							<span className={styles.label}>주소</span>
							<span className={styles.value}>
								({userAddress.zonecode}) {userAddress.address}
							</span>
						</div>

						<div className={styles.row}>
							<span className={styles.label}>상세주소</span>
							<span className={styles.value}>{userAddress.addressDetail}</span>
						</div>

						{/* 배송 메모 */}
						<div className="flex">
							<div className="w-[30%]">메모</div>

							<div className="w-[70%] text-base">
								<p className={styles.memo}>{userAddress.memo}</p>
							</div>
						</div>
					</div>

					{props.page === "BUY" && (
						<div className={styles.addressActions}>
							<button
								onClick={() => {
									// props.changeAddress({ ...userAddress });
								}}
							>
								베송지 변경
							</button>
						</div>
					)}

					{props.page === "MYPAGE" && (
						<div className={styles.addressActions}>
							{!userAddress.defaultAddress && (
								<button
									onClick={() => {
										props.changeAddress({
											...userAddress,
											defaultAddress: true,
										});
										openModal("CONFIRM", {
											content: "기본배송지를 변경하시겠습니까??",
											okResult: "ADDRESS_DEFAULT_CHANGE",
										});
									}}
								>
									기본배송지로
								</button>
							)}
							<button
								onClick={() => {
									props.changeAddress({ ...userAddress });
									openModal("ADDRESS_SET", {
										address: userAddress,
										disableOverlayClose: true,
									});
								}}
							>
								수정
							</button>
							<button
								onClick={() => {
									props.changeAddress({
										...userAddress,
									});
									openModal("CONFIRM", {
										content: `'${userAddress.addressName}' 배송지를 삭제하시겠습니까?`,
										okResult: "ADDRESS_DELETE",
									});
								}}
							>
								삭제
							</button>
						</div>
					)}
				</li>
			))}
		</ul>
	);
};
