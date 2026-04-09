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
import { DialogResultMap, DomainModalResultMap } from "@/store/modal.type";
import { useGlobalDialogStore } from "@/store/globalDialog.store";

export default function MyShippingAddressClient() {
	const { loginOn } = useAuth();
	const queryClient = useQueryClient();
	const { openModal, clearModalResult, modalResult } = useModalStore();
	const { clearDialogResult, dialogResult } = useGlobalDialogStore();

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
		mutationFn: () =>
			deleteNormal<BaseResponse>(getApiUrl(API_URL.MY_ADDRESS_DELETE), {
				addressId: changingDefaultAddressRef.current?.addressId,
			}),
		onSuccess(data) {
			console.log(data);
		},
		onError(err) {
			console.log(err);
		},
	});
	const [userAddressList, setUserAddressList] = useState<UserAddressListItem[] | []>([]);
	useEffect(() => {
		if (!isLoading && userAddressData) {
			setUserAddressList([...userAddressData.userAddressList]);
		}
	}, [isLoading, userAddressData]);
	// 기본배송지 변경
	const changingDefaultAddressRef = useRef(null as UserAddressListItem | null);

	useEffect(() => {
		if (!dialogResult) return;
		if (dialogResult?.action === "CONFIRM_OK") {
			const payload = dialogResult.payload as DialogResultMap["CONFIRM_OK"];
			// 기본값 변경
			if (payload?.result === "ADDRESS_DEFAULT_CHANGE") {
				const changing = async () => {
					if (changingDefaultAddressRef.current) {
						await handleAddressUpdate.mutateAsync(changingDefaultAddressRef.current);
						queryClient.invalidateQueries({ queryKey: ["userAddressList"] });
					}
				};
				changing();
			}
			// 주소 삭제
			if (payload?.result === "ADDRESS_DELETE") {
				const deleting = async () => {
					await handleAddressDelete.mutateAsync();
					queryClient.invalidateQueries({ queryKey: ["userAddressList"] });
				};
				deleting();
			}
		}

		clearDialogResult();
	}, [dialogResult, clearDialogResult, handleAddressUpdate, handleAddressDelete, queryClient]);
	// 모달에서 확인 누른 후 처리할 작업들 (기본배송지 변경, 배송지 삭제, 배송지 추가/수정)
	useEffect(() => {
		if (!modalResult) return;

		// 주소 추가
		if (modalResult?.action === "ADDRESS_SET") {
			const payload = modalResult.payload as DomainModalResultMap["ADDRESS_SET"];
			const addressUpdating = async () => {
				const nextAddress = { ...changingDefaultAddressRef.current, ...payload };
				if (nextAddress) {
					if (!nextAddress?.addressId) await handleAddressAdd.mutateAsync(nextAddress);
					else await handleAddressUpdate.mutateAsync(nextAddress);
					queryClient.invalidateQueries({ queryKey: ["userAddressList"] });
				}
			};
			addressUpdating();
		}
		clearModalResult();
	}, [modalResult, clearModalResult, handleAddressAdd, handleAddressUpdate, queryClient]);

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
						changeAddress={(address) => {
							changingDefaultAddressRef.current = address;
						}}
					/>
					<div className={styles.addressAdd}>
						<button
							onClick={() => {
								changingDefaultAddressRef.current = null;
								openModal("ADDRESS_SET", {
									prevAddress: undefined,
									disableOverlayClose: true,
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
