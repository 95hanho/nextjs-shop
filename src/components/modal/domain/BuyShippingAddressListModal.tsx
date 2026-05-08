import { ShippingAddressList } from "@/components/address/ShippingAddressList";
import { ModalFrame } from "@/components/modal/frame/ModalFrame";
import styles from "./BuyShippingAddressListModal.module.scss";
import { DomainModalPropsMap } from "@/store/modal.type";
import { useGetUserAddressList } from "@/hooks/query/user/useGetUserAddressList";

type ShippingAddressListProps = {
	onClose: () => void;
} & DomainModalPropsMap["BUY_ADDRESSLIST"];

export const BuyShippingAddressListModal = ({ onClose, handleAfterChangeBuyAddress }: ShippingAddressListProps) => {
	// 3) [useQuery / useMutation] -----------------------------------------
	const { data: userAddressList } = useGetUserAddressList();

	if (!userAddressList) return null;
	return (
		<ModalFrame title="배송지 목록" onClose={onClose} contentVariant="address">
			<div className={styles.addressListContainer}>
				<ShippingAddressList
					page="BUY"
					userAddressList={userAddressList}
					changeBuyAddress={(address) => {
						handleAfterChangeBuyAddress(address);
						onClose();
					}}
				/>
			</div>
		</ModalFrame>
	);
};
