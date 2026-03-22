import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { ShippingAddressList } from "@/components/address/ShippingAddressList";
import { ModalFrame } from "@/components/modal/frame/ModalFrame";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetUserAddressListResponse, UserAddressListItem } from "@/types/mypage";
import { useQuery } from "@tanstack/react-query";

interface ShippingAddressListProps {
	onClose: () => void;
}

export const BuyShippingAddressListModal = ({ onClose }: ShippingAddressListProps) => {
	const { loginOn } = useAuth();

	// 유저 배송지 조회
	const { data: userAddressData, isLoading } = useQuery<GetUserAddressListResponse, Error, UserAddressListItem[]>({
		queryKey: ["userAddressList"],
		queryFn: () => getNormal(getApiUrl(API_URL.MY_ADDRESS)),
		select: (data) => data.userAddressList,
		enabled: loginOn,
	});

	if (!userAddressData) return null;
	return (
		<ModalFrame title="배송지 목록" onClose={onClose} contentVariant="address">
			<div className="text-sm">
				<ShippingAddressList page="BUY" userAddressList={userAddressData} />
			</div>
		</ModalFrame>
	);
};
