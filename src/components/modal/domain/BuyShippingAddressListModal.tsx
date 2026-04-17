import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { ShippingAddressList } from "@/components/address/ShippingAddressList";
import { ModalFrame } from "@/components/modal/frame/ModalFrame";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetUserAddressListResponse, UserAddressListItem } from "@/types/mypage";
import { useQuery } from "@tanstack/react-query";
import styles from "./BuyShippingAddressListModal.module.scss";
import { DomainModalPropsMap } from "@/store/modal.type";

type ShippingAddressListProps = {
	onClose: () => void;
} & DomainModalPropsMap["BUY_ADDRESSLIST"];

export const BuyShippingAddressListModal = ({ onClose, handleAfterChangeBuyAddress }: ShippingAddressListProps) => {
	const { loginOn } = useAuth();

	// 유저 배송지 조회
	const { data: userAddressData } = useQuery<GetUserAddressListResponse, Error, UserAddressListItem[]>({
		queryKey: ["userAddressList"],
		queryFn: () => getNormal(getApiUrl(API_URL.MY_ADDRESS)),
		select: (data) => data.userAddressList,
		enabled: loginOn,
	});

	if (!userAddressData) return null;
	return (
		<ModalFrame title="배송지 목록" onClose={onClose} contentVariant="address">
			<div className={styles.addressListContainer}>
				<ShippingAddressList
					page="BUY"
					userAddressList={userAddressData}
					changeBuyAddress={(address) => {
						handleAfterChangeBuyAddress(address);
						onClose();
					}}
				/>
			</div>
		</ModalFrame>
	);
};
