"use client";

import API_URL from "@/api/endpoints";
import { deleteNormal, getNormal, postJson, putJson } from "@/api/fetchFilter";
import { FormPageShell } from "@/components/auth/FormPageShell";
import { LodingWrap } from "@/components/common/LodingWrap";
import { AddressForm } from "@/components/modal/domain/AddressModal";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useModalStore } from "@/store/modal.store";
import { ModalResultMap } from "@/store/modal.type";
import { BaseResponse } from "@/types/common";
import { GetUserAddressListResponse, setUserAddressRequest, UserAddressListItem } from "@/types/mypage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Error from "next/error";
import { useEffect, useState } from "react";
import styles from "./MyAddressClient.module.scss";

export default function MyAddressClient() {
	const { loginOn } = useAuth();
	const queryClient = useQueryClient();
	const { openModal, clearModalResult, modalResult } = useModalStore();

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
				addressId: changeAddress?.addressId,
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
	const [changeAddress, setChangeAddress] = useState<UserAddressListItem | null>(null);
	// Confirm
	useEffect(() => {
		if (modalResult?.action === "CONFIRM_OK") {
			const payload = modalResult.payload as ModalResultMap["CONFIRM_OK"];
			// 기본값 변경
			if (payload?.result === "ADDRESS_DEFAULT_CHANGE") {
				const changing = async () => {
					if (changeAddress) {
						await handleAddressUpdate.mutateAsync(changeAddress);
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
				console.log("삭제가 된다구??");
				deleting();
			}
		}
		// 주소 추가
		if (modalResult?.action === "ADDRESS_SET") {
			const payload = modalResult.payload as AddressForm;
			console.log("payload", payload);
			// console.log("changeAddress", changeAddress);
			const addressUpdating = async () => {
				const nextAddress = { ...changeAddress, ...payload };
				if (nextAddress) {
					if (!nextAddress?.addressId) await handleAddressAdd.mutateAsync(nextAddress);
					else await handleAddressUpdate.mutateAsync(nextAddress);
					queryClient.invalidateQueries({ queryKey: ["userAddressList"] });
				}
			};
			addressUpdating();
		}
		clearModalResult();
	}, [modalResult]);
	// }, [modalResult, clearModalResult, handleAddressAdd, handleAddressDelete, queryClient]);

	// if (isLoading && !userAddressList.length) return null;
	return (
		<FormPageShell title="배송지 관리" formWidth={430} wrapMinHeight={100}>
			{isLoading || !userAddressList.length ? (
				<div className="relative h-40">
					<LodingWrap bgColor="#fff" />
				</div>
			) : (
				<div>
					<ul className={styles.addressList}>
						{userAddressList.map((userAddress) => (
							<li
								key={"userAddress" + userAddress.addressId}
								className="p-3 border-solid border-gray-400 bg-[#fffdf0] rounded-[8px] mb-2 border-w border-[2px]"
							>
								<h3 className="relative pt-[7px] pb-[2px] text-2xl text-left flex justify-between">
									<span className="inline-block pl-3 text-2xl">{userAddress.addressName}</span>
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

										<div className="w-[70%]">
											<p className={styles.memo}>{userAddress.memo}</p>
										</div>
									</div>
								</div>

								<div className={styles.addressActions}>
									{!userAddress.defaultAddress && (
										<button
											onClick={() => {
												setChangeAddress({
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
											setChangeAddress({ ...userAddress });
											openModal("ADDRESSSET", {
												address: userAddress,
												disableOverlayClose: true,
											});
										}}
									>
										수정
									</button>
									<button
										onClick={() => {
											setChangeAddress({
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
							</li>
						))}
					</ul>

					<div className={styles.addressAdd}>
						<button
							onClick={() => {
								setChangeAddress(null);
								openModal("ADDRESSSET", {
									address: undefined,
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
		// </div>
	);
}
