"use client";

import API_URL from "@/api/endpoints";
import { deleteNormal, getNormal, postJson } from "@/api/fetchFilter";
import OptionSelector from "@/components/ui/OptionSelector";
import useAuth from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { useModalStore } from "@/store/modal.store";
import { ModalResultMap } from "@/store/modal.type";
import { BaseResponse } from "@/types/common";
import { GetUserAddressListResponse, UserAddressListItem } from "@/types/mypage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Error from "next/error";
import { useEffect, useState } from "react";

export default function myAddressPage() {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const { openModal, clearModalResult, modalResult } = useModalStore();

	// 유저 배송지 조회
	const { data: userAddressData, isLoading } = useQuery<GetUserAddressListResponse, Error, GetUserAddressListResponse>({
		queryKey: ["userAddressList", user?.userId],
		queryFn: () => getNormal(getApiUrl(API_URL.MY_ADDRESS)),
		select(data) {
			return {
				...data,
				userAddressList: [...data.userAddressList].sort((a, b) => Number(b.defaultAddress) - Number(a.defaultAddress)),
			};
		},
		enabled: !!user?.userId,
	});
	// 유저 배송지 추가/수정
	const handleAddressChange = useMutation({
		mutationFn: () =>
			postJson<BaseResponse>(getApiUrl(API_URL.MY_ADDRESS), {
				...changeAddress,
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
			if (payload?.result === "ADDRESS_DEFAULT_CHANGE") {
				const changing = async () => {
					await handleAddressChange.mutateAsync();
					queryClient.invalidateQueries({ queryKey: ["userAddressList"] });
				};
				changing();
			}
			if (payload?.result === "ADDRESS_DELETE") {
				const deleting = async () => {
					await handleAddressDelete.mutateAsync();
					queryClient.invalidateQueries({ queryKey: ["userAddressList"] });
				};
				deleting();
			}
		}
		clearModalResult();
	}, [modalResult]);

	if (isLoading && !userAddressList.length) return null;
	return (
		<main id="myAddress" className="user-info delivery-address">
			<div className="form-wrap">
				<div className="address-container">
					<h2 className="page-title">배송지 관리</h2>

					<ul className="address-list">
						{userAddressList.map((userAddress) => (
							<li key={"userAddress" + userAddress.addressId} className="address-item">
								<h3 className="address-header">
									<span className="address-name">{userAddress.addressName}</span>
									<span className="address-phone">{userAddress.addressPhone}</span>
									{userAddress.defaultAddress && <span className="default-mark">기본배송지</span>}
								</h3>

								<div className="address-body">
									{/* 공통 주소 정보 */}
									<div className="address-row">
										<span className="address-label">우편번호</span>
										<span className="address-value">{userAddress.zonecode}</span>
									</div>

									<div className="address-row">
										<span className="address-label">주소</span>
										<span className="address-value">{userAddress.address}</span>
									</div>

									<div className="address-row">
										<span className="address-label">상세주소</span>
										<span className="address-value">{userAddress.addressDetail}</span>
									</div>

									{/* 배송 메모 */}
									<div className="address-memo">
										<div className="address-label">메모</div>

										<div className="memo-content">
											{/* <div className="memo-selector">
												<OptionSelector
													optionSelectorName="deliveryMemo"
													pickIdx={0}
													initData={{
														id: 1,
														val: "문 앞에 놓아주세요",
													}}
													optionList={[
														{ id: 1, val: "문 앞에 놓아주세요" },
														{ id: 2, val: "경비실에 맡겨주세요" },
														{ id: 3, val: "부재 시 전화 주세요" },
														{ id: 4, val: "배송 전 연락 바랍니다" },
														{ id: 5, val: "직접 입력" },
													]}
													changeOption={(id) => {}}
												/>
											</div> */}

											<p className="memo-text">{userAddress.memo}</p>
										</div>
									</div>
								</div>

								<div className="address-actions">
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
										className="btn-edit"
										onClick={() => {
											openModal("ADDRESSUPDATE", {
												address: userAddress,
											});
										}}
									>
										수정
									</button>
									<button
										className="btn-delete"
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

					<div className="address-add">
						<button className="btn-add">추가 +</button>
					</div>
				</div>
			</div>
		</main>
	);
}
