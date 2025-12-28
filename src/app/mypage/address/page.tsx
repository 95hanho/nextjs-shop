"use client";

import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import OptionSelector from "@/components/ui/OptionSelector";
import useAuth from "@/hooks/useAuth";
import { getApiUrl } from "@/lib/getBaseUrl";
import { GetUserAddressListResponse, UserAddressListItem } from "@/types/mypage";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function myAddressPage() {
	const { user } = useAuth();

	const { data: userAddressData, isLoading } = useQuery<GetUserAddressListResponse>({
		queryKey: ["userAddressList", user?.userId],
		queryFn: () => getNormal(getApiUrl(API_URL.MY_ADDRESS)),
		enabled: !!user?.userId,
	});
	const [userAddressList, setUserAddressList] = useState<UserAddressListItem[] | []>([]);
	useEffect(() => {
		if (!isLoading && userAddressData) {
			setUserAddressList(userAddressData.userAddressList);
		}
	}, [isLoading]);

	// const userAddressList = [
	// 	{
	// 		addressId: 1,
	// 		addressName: "주소1",
	// 		addressPhone: "01085546674",
	// 		zonecode: "16828",
	// 		address: "경기도 용인시 수지구 수풍로116번길 10",
	// 		addressDetail: "102호",
	// 		memo: "정문(1597#) 우편함 오른쪽 밑 보관함.",
	// 		createdAt: "2025-10-20T05:56:25.000+00:00",
	// 		usedateAt: null,
	// 		userId: null,
	// 		deleted: false,
	// 		default: true,
	// 	},
	// ];

	if (isLoading) return null;
	console.log(userAddressData);
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
									<button className="btn-edit">수정</button>
									<button className="btn-delete">삭제</button>
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
