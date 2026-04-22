"use client";

import { AddressAlarm, AddressFormFormInputRefs, ShippingAddressMode } from "@/components/ui/context/buyContext";
import { ChangeEvent } from "@/types/event";
import { UserAddress, UserAddressListItem } from "@/types/mypage";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buyContext } from "@/components/ui/context/buyContext";
import { DefaultAddress, payRequest } from "@/types/buy";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import API_URL from "@/api/endpoints";
import { getApiUrl } from "@/lib/getBaseUrl";
import { postJson } from "@/api/fetchFilter";
import { useRouter } from "next/navigation";
import { useGlobalDialogStore } from "@/store/globalDialog.store";

const addressFormRegex: { [key: string]: RegExp } = {
	addressPhone: /^(010|011|016|017|018|019)\d{3,4}\d{4}$/,
};
const addressFormRegexFailMent: { [key: string]: string } = {
	addressPhone: "휴대폰 번호 형식에 일치하지 않습니다.",
};

interface BuyProviderProps {
	children: React.ReactNode;
	initialDefaultAddress: DefaultAddress | null;
	holdIds: number[];
}

export const BuyProvider = ({ children, initialDefaultAddress = null, holdIds }: BuyProviderProps) => {
	// 1) [store / custom hooks] -------------------------------------------
	const { openDialog } = useGlobalDialogStore();
	const queryClient = useQueryClient();
	const router = useRouter();

	// 2) [useState / useRef] ----------------------------------------------
	// 기존 배송지 || 신규배송지
	const [shippingAddress, setShippingAddress] = useState<UserAddress | null>(initialDefaultAddress);
	// 배송지의 기본값 현재 여부
	const [currentDefaultStatus, setCurrentDefaultStatus] = useState<boolean>(false);
	// 기본 배송지로 할지 여부
	const [setAsDefault, setSetAsDefault] = useState<boolean>(false);
	// 모드(기존배송지/신규배송지)
	const [shippingAddressMode, setShippingAddressMode] = useState<ShippingAddressMode>(initialDefaultAddress ? "existing" : "new");
	// 배송 메모
	const [shippingMemo, setShippingMemo] = useState(initialDefaultAddress ? initialDefaultAddress.memo : ""); // 기존 배송지가 있으면 그 메모를 기본값으로, 없으면 빈 문자열
	// 신규 배송지 입력값
	const [newAddress, setNewAddress] = useState<UserAddress>({
		addressName: "",
		recipientName: "",
		zonecode: "",
		address: "",
		addressDetail: "",
		addressPhone: "",
		memo: "",
	});
	// 주소 폼 알람
	const [addressAlarm, setAddressAlarm] = useState<AddressAlarm>(null);
	const addressFormInputRefs = useRef<Partial<AddressFormFormInputRefs>>({});
	// 마일리지 사용 금액
	const [usedMileage, setUsedMileage] = useState(0);
	// 결제 방법 'CARD','CASH'
	const [paymentMethod, setPaymentMethod] = useState<"CARD" | "CASH" | null>(null);

	// 3) [useQuery / useMutation] -----------------------------------------
	// 결제하기
	const { mutateAsync: mutateBuy } = useMutation({
		mutationFn: (data: payRequest) => postJson(getApiUrl(API_URL.BUY_PAY), data),
		onSuccess(data) {
			console.log("mutateBuy success", data);

			queryClient.invalidateQueries({ queryKey: ["me"] }); // 사용자 정보 다시 가져오기(마일리지, 주문내역 등 변경된 정보 반영 위해)

			// 구매 완료 페이지로
			router.push("/buy/complete");
		},
		onError(err) {
			console.log("mutateBuy err", err);

			// NOT_MATCHED_HOLD : 결제 상품이 점유 상품과 일치하지 않음
			// COUPON_UNAVAILABLE_FAILED : 쿠폰 사용 불가
			// MILEAGE_UNAVAILABLE_FAILED : 마일리지 사용 불가
			// STOCK_UPDATE_FAILED : 재고 업데이트 실패
			// ORDER_ITEM_NOT_FOUND : 주문 상품을 찾을 수 없음
			// MILEAGE_UPDATE_FAILED : 마일리지 업데이트 실패
			// STOCK_HOLD_UPDATE_FAILED : 점유 정보 업데이트 실패

			// 실패 시 재조회하여 처리
			queryClient.invalidateQueries({ queryKey: ["stockHold"] }); // 점유 상품 정보 다시 가져오기
		},
	});

	// 5) [handlers / useCallback] -----------------------------------------
	// 신규 배송지 입력값 변경
	const changeNewAddress = useCallback((e?: ChangeEvent, changeMap?: Partial<UserAddress>) => {
		if (changeMap) {
			setNewAddress((prev) => ({
				...prev,
				...changeMap,
			}));
		} else if (e) {
			setNewAddress((prev) => ({
				...prev,
				[e.target.name]: e.target.value,
			}));
		}
		setAddressAlarm(null);
	}, []);
	// 신규 배송지 유효성 확인 ex) 정규표현식 확인
	const validateNewAddress = useCallback((e: ChangeEvent) => {
		const { name, value } = e.target as {
			name: keyof UserAddress;
			value: string;
		};
		const changeVal = value.trim();
		let changeAlarm: AddressAlarm | null = null;

		if (!changeVal) return;
		if (changeVal) {
			if (addressFormRegex[name]) {
				if (!addressFormRegex[name].test(changeVal)) {
					changeAlarm = { name, message: addressFormRegexFailMent[name], status: "FAIL" };
				}
			}
		}
		setAddressAlarm(changeAlarm);
		setNewAddress((prev) => ({
			...prev,
			[name]: changeVal,
		}));
	}, []);
	// 마일리지 입력값 변경
	const changeUsedMileage = useCallback((e: ChangeEvent, availableMileage: number) => {
		const numericValue = e.target.value.replace(/[^0-9]/g, "");
		const value = Math.min(Number(numericValue), availableMileage);
		setUsedMileage(value);
	}, []);
	// 구매 배송지 변경
	const buyAddressChange = useCallback((address: UserAddressListItem) => {
		setShippingAddress(address);
		setShippingMemo(address?.memo || "문 앞에 놓아주세요");
		setCurrentDefaultStatus(address?.defaultAddress || false);
		setSetAsDefault(false);
	}, []);
	// 결제하기
	const handleBuy = useCallback(() => {
		console.log("[handleBuy] 실행");
		if (addressAlarm?.status === "FAIL") {
			addressFormInputRefs.current[addressAlarm.name]?.focus();
			return;
		}
		let address: UserAddress = {} as UserAddress;
		let changeAlarm: AddressAlarm | null = null;
		if (shippingAddressMode === "existing" && shippingAddress) {
			if (!newAddress.memo) {
				changeAlarm = { name: "memo", message: "배송 메모를 입력해주세요.", status: "FAIL" };
			}
			address = {
				...shippingAddress,
				memo: newAddress.memo,
			};
		} else if (shippingAddressMode === "new") {
			address = {
				...newAddress,
			};
			const alertKeys = Object.keys(address) as (keyof UserAddress)[];
			for (const key of alertKeys) {
				console.log({ key, ele: addressFormInputRefs.current[key] });
				if (!addressFormInputRefs.current[key]) continue;
				const value = address[key];
				// 알림 없을 때 처음 누를 때
				if (!value) {
					changeAlarm = { name: key, message: "해당 내용을 입력해주세요.", status: "FAIL" };
				}
				// 정규표현식 검사
				else if (addressFormRegex[key] && typeof value === "string") {
					if (!addressFormRegex[key].test(value)) {
						changeAlarm = { name: key, message: addressFormRegexFailMent[key], status: "FAIL" };
					}
				}
				if (changeAlarm) break;
			}
		}

		if (changeAlarm?.status === "FAIL") {
			setAddressAlarm(changeAlarm);
			addressFormInputRefs.current[changeAlarm.name]?.focus();
			return;
		}
		if (paymentMethod === null) {
			openDialog("ALERT", { content: "결제 수단을 선택해주세요." });
			document.getElementById("paymentMethod")?.scrollIntoView({ behavior: "smooth" });
			return;
		}
		// console.log("구매 처리 로직 실행", { shippingAddress: address, setAsDefault, usedMileage, paymentMethod, holdIds });
		const buyData: payRequest = {
			shippingAddress: address,
			setAsDefault,
			usedMileage,
			paymentMethod,
			holdIds,
		};
		mutateBuy(buyData);
	}, [
		shippingAddressMode,
		shippingAddress,
		newAddress,
		setAsDefault,
		usedMileage,
		paymentMethod,
		addressAlarm,
		openDialog,
		holdIds,
		addressFormInputRefs,
		mutateBuy,
	]);

	// 6) [useEffect] ------------------------------------------------------
	// 처음 기본 배송지 가져올 때
	useEffect(() => {
		setShippingAddress(initialDefaultAddress);
		setCurrentDefaultStatus(initialDefaultAddress?.defaultAddress || false);
		setShippingAddressMode(initialDefaultAddress ? "existing" : "new");
		setShippingMemo(initialDefaultAddress?.memo || "문 앞에 놓아주세요");
	}, [initialDefaultAddress]);
	// 디버깅용 log
	useEffect(() => {
		// if (shippingAddress) console.log({ shippingAddress });
	}, [shippingAddress, shippingAddressMode, newAddress, usedMileage]);

	// 7) [UI helper values] -------------------------------------------------
	const value = useMemo(
		() => ({
			shippingAddress,
			setShippingAddress,
			currentDefaultStatus,
			setAsDefault,
			setSetAsDefault,
			shippingAddressMode,
			setShippingAddressMode,
			shippingMemo,
			newAddress,
			addressAlarm,
			setAddressAlarm,
			addressFormInputRefs,
			usedMileage,
			setUsedMileage,
			paymentMethod,
			setPaymentMethod,
			changeNewAddress,
			validateNewAddress,
			changeUsedMileage,
			buyAddressChange,
			handleBuy,
		}),
		[
			shippingAddress,
			currentDefaultStatus,
			setAsDefault,
			shippingAddressMode,
			shippingMemo,
			newAddress,
			addressAlarm,
			setAddressAlarm,
			usedMileage,
			paymentMethod,
			changeNewAddress,
			validateNewAddress,
			changeUsedMileage,
			buyAddressChange,
			handleBuy,
		],
	);

	return <buyContext.Provider value={value}>{children}</buyContext.Provider>;
};
