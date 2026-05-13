"use client";

import API_URL from "@/api/endpoints";
import { deleteNormal, postJson, putJson } from "@/api/fetchFilter";
import { FormPageShell } from "@/components/form/FormPageShell";
import { LodingWrap } from "@/components/common/LodingWrap";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useModalStore } from "@/store/modal.store";
import { BaseResponse } from "@/types/common";
import { setUserAddressRequest, UserAddressListItem } from "@/types/mypage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import styles from "./MyShippingAddress.module.scss";
import { ShippingAddressList } from "@/components/address/ShippingAddressList";
import { useGetUserAddressList } from "@/hooks/query/user/useGetUserAddressList";

export default function MyShippingAddressClient() {
	// 1) [store / providers / custom hooks] -----------------------------------
	const queryClient = useQueryClient();
	const { openModal } = useModalStore();

	// 2) [useState / useRef] --------------------------------------
	const [userAddressList, setUserAddressList] = useState<UserAddressListItem[] | []>([]);
	// 배송지 리스트 ref (추후에 주소 추가/수정 후 해당 주소로 스크롤 이동할 때 사용)
	const addressListRef = useRef<HTMLUListElement | null>(null);

	// 3) [useQuery / useMutation] ---------------------------------
	const { data: initUserAddressList, isLoading } = useGetUserAddressList();
	// 유저 배송지 추가
	const addressAddMutation = useMutation({
		mutationFn: (address: setUserAddressRequest) =>
			postJson<BaseResponse, setUserAddressRequest>(getApiUrl(API_URL.MY_ADDRESS), {
				...address,
			}),
	});
	// 유저 배송지 수정/ 기본주소 변경
	const addressUpdateMutation = useMutation({
		mutationFn: (address: setUserAddressRequest) =>
			putJson<BaseResponse, setUserAddressRequest>(getApiUrl(API_URL.MY_ADDRESS), {
				...address,
			}),
	});
	// 유저 배송지 삭제
	const addressDeleteMutation = useMutation({
		mutationFn: (addressId: number) =>
			deleteNormal<BaseResponse>(getApiUrl(API_URL.MY_ADDRESS_DELETE), {
				addressId,
			}),
	});

	// 6) [useEffect] ----------------------------------------------
	useEffect(() => {
		if (!isLoading && initUserAddressList && initUserAddressList.length > 0) {
			setUserAddressList([...initUserAddressList]);
		}
	}, [isLoading, initUserAddressList]);

	// if (isLoading && !userAddressList.length) return null;
	return (
		<FormPageShell title="배송지 관리" formWidth={430} wrapMinHeight={100}>
			{isLoading || !userAddressList.length ? (
				<div className="relative h-40">
					<LodingWrap bgColor="#fff" />
				</div>
			) : (
				<div className="relative text-base">
					<ShippingAddressList
						page="MYPAGE"
						userAddressList={userAddressList}
						openAddressModal={(address) => {
							openModal("ADDRESS_SET", {
								prevAddress: address,
								disableOverlayClose: true,
								handleAfterSetAddress: async (nextAddress) => {
									await addressUpdateMutation.mutateAsync({ ...address, ...nextAddress });
									await queryClient.invalidateQueries({ queryKey: ["userAddressList"] });
								},
							});
						}}
						changeDefaultAddress={async (address) => {
							await addressUpdateMutation.mutateAsync(address);
							await queryClient.invalidateQueries({ queryKey: ["userAddressList"] });
						}}
						deleteAddress={async (addressId) => {
							await addressDeleteMutation.mutateAsync(addressId);
							await queryClient.invalidateQueries({ queryKey: ["userAddressList"] });
						}}
						ref={(el) => {
							addressListRef.current = el;
						}}
					/>
					<div className={styles.addressAdd}>
						<button
							onClick={() => {
								openModal("ADDRESS_SET", {
									prevAddress: undefined,
									disableOverlayClose: true,
									handleAfterSetAddress: async (nextAddress) => {
										await addressAddMutation.mutateAsync(nextAddress);
										await queryClient.invalidateQueries({ queryKey: ["userAddressList"] });
										addressListRef.current?.scrollTo({ top: 0, behavior: "instant" });
									},
								});
							}}
						>
							추가 +
						</button>
					</div>
				</div>
			)}
		</FormPageShell>
	);
}
