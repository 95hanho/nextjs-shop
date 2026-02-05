import { FormInput } from "@/components/auth/FormInput";
import { ChangeFunction } from "@/types/event";
import { FormInputAlarm, SetFormRef } from "@/types/form";

export type AddressResult = { zonecode: string; address: string };

type AddressForm = {
	address: string;
	addressDetail: string;
};

interface AddressSectionProps<K extends string> {
	form: AddressForm;
	alarm: FormInputAlarm<K>;
	setAddress: ({ zonecode, address }: { zonecode: string; address: string }) => void;
	changeForm: ChangeFunction;
	validateForm: ChangeFunction;
	setFormRef: SetFormRef;
}

export const AddressSection = <K extends string>({ form, alarm, setAddress, changeForm, validateForm, setFormRef }: AddressSectionProps<K>) => {
	// 주소API 팝업 띄우기
	const addressPopup = () => {
		new kakao.Postcode({
			oncomplete: (data) => {
				const fullAddress = data.roadAddress || data.jibunAddress;
				setAddress({
					zonecode: data.zonecode,
					address: fullAddress,
				});
			},
		}).open({
			popupKey: "addpopup1",
		});
	};

	return (
		<>
			<FormInput
				name="address"
				label="주소"
				placeholder="주소를 입력해주세요."
				value={form.address}
				alarm={alarm}
				readOnly
				onClick={addressPopup}
				onBlur={validateForm}
				searchBtn={{ txt: "검색", fnc: addressPopup }}
			/>
			<FormInput
				name="addressDetail"
				label="상세주소"
				placeholder="상세주소를 입력해주세요."
				value={form.addressDetail}
				alarm={alarm}
				onChange={changeForm}
				onBlur={validateForm}
				ref={(el) => {
					setFormRef(el);
				}}
			/>
		</>
	);
};
