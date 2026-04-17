"use client";

import API_URL from "@/api/endpoints";
import { deleteNormal, getNormal, postJson, putJson } from "@/api/fetchFilter";
import { FormPageShell } from "@/components/form/FormPageShell";
import { LodingWrap } from "@/components/common/LodingWrap";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useModalStore } from "@/store/modal.store";
import { BaseResponse } from "@/types/common";
import { GetUserAddressListResponse, setUserAddressRequest, UserAddressListItem } from "@/types/mypage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Error from "next/error";
import { useEffect, useRef, useState } from "react";
import styles from "./MyShippingAddress.module.scss";
import { ShippingAddressList } from "@/components/address/ShippingAddressList";

export default function MyShippingAddressClient() {
	const { loginOn } = useAuth();
	const queryClient = useQueryClient();
	const { openModal } = useModalStore();

	// ----------------------------------------------------------------------
	// React Query
	// ----------------------------------------------------------------------

	// 유저 배송지 조회
	const { data: userAddressData, isLoading } = useQuery<GetUserAddressListResponse, Error, GetUserAddressListResponse>({
		queryKey: ["userAddressList"],
		queryFn: () => getNormal(getApiUrl(API_URL.MY_ADDRESS)),
		enabled: loginOn,
	});
	// 유저 배송지 추가
	const handleAddressAdd = useMutation({
		mutationFn: (address: setUserAddressRequest) =>
			postJson<BaseResponse, setUserAddressRequest>(getApiUrl(API_URL.MY_ADDRESS), {
				...address,
			}),
		onSuccess(data) {
			console.log(data);
		},
		onError(err) {
			console.log(err);
		},
	});
	// 유저 배송지 수정/ 기본주소 변경
	const handleAddressUpdate = useMutation({
		mutationFn: (address: setUserAddressRequest) =>
			putJson<BaseResponse, setUserAddressRequest>(getApiUrl(API_URL.MY_ADDRESS), {
				...address,
			}),
		onSuccess(data) {
			console.log(data);
		},
		onError(err) {
			console.log(err);
		},
	});
	// 유저 배송지 삭제
	const handleAddressDelete = useMutation({
		mutationFn: (addressId: number) =>
			deleteNormal<BaseResponse>(getApiUrl(API_URL.MY_ADDRESS_DELETE), {
				addressId,
			}),
		onSuccess(data) {
			console.log(data);
		},
		onError(err) {
			console.log(err);
		},
	});

	// ----------------------------------------------------------------------
	// React
	// ----------------------------------------------------------------------

	const [userAddressList, setUserAddressList] = useState<UserAddressListItem[] | []>([]);
	// 배송지 리스트 ref (추후에 주소 추가/수정 후 해당 주소로 스크롤 이동할 때 사용)
	const addressListRef = useRef<HTMLUListElement | null>(null);

	// ----------------------------------------------------------------------
	// useEffect
	// ----------------------------------------------------------------------

	useEffect(() => {
		if (!isLoading && userAddressData) {
			setUserAddressList([...userAddressData.userAddressList]);
		}
	}, [isLoading, userAddressData]);

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
									await handleAddressUpdate.mutateAsync({ ...address, ...nextAddress });
									await queryClient.invalidateQueries({ queryKey: ["userAddressList"] });
								},
							});
						}}
						changeDefaultAddress={async (address) => {
							await handleAddressUpdate.mutateAsync(address);
							await queryClient.invalidateQueries({ queryKey: ["userAddressList"] });
						}}
						deleteAddress={async (addressId) => {
							await handleAddressDelete.mutateAsync(addressId);
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
										await handleAddressAdd.mutateAsync(nextAddress);
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
