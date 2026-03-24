import { FormInput } from "@/components/auth/FormInput";
import { ChangeFunction } from "@/types/event";
import { FormInputAlarm, SetFormRef } from "@/types/form";

type AddressForm = {
	zonecode?: string;
	address: string;
	addressDetail: string;
};

interface AddressSectionProps<K extends string> {
	form: AddressForm;
	alarm: FormInputAlarm<K>;
	handleKakaoAddress: ({ zonecode, address }: { zonecode: string; address: string }) => void;
	changeForm: ChangeFunction;
	validateForm: ChangeFunction;
	setAddressRef: SetFormRef;
	setAddressDetailRef: SetFormRef;
	requiredMark?: boolean;
	addressDetailReadOnly?: boolean;
	labelWidthPercent?: number;
	inputWidthPercent?: number;
}

export const AddressSection = <K extends string>({
	form,
	alarm,
	handleKakaoAddress,
	changeForm,
	validateForm,
	setAddressRef,
	setAddressDetailRef,
	requiredMark,
	addressDetailReadOnly = false,
	labelWidthPercent,
	inputWidthPercent,
}: AddressSectionProps<K>) => {
	// 주소API 팝업 띄우기
	const addressPopup = () => {
		new kakao.Postcode({
			oncomplete: (data) => {
				const fullAddress = data.roadAddress || data.jibunAddress;
				handleKakaoAddress({
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
			{form?.zonecode !== undefined && (
				<FormInput
					name="zonecode"
					label="우편번호"
					placeholder="우편번호를 입력해주세요."
					value={form?.zonecode || ""}
					readOnly
					onClick={addressPopup}
					searchBtn={addressDetailReadOnly ? undefined : { txt: "검색", fnc: addressPopup }}
					cursorPointer={true}
					requiredMark={requiredMark}
					labelWidthPercent={labelWidthPercent}
					inputWidthPercent={50}
				/>
			)}
			<FormInput
				name="address"
				label="주소"
				placeholder="주소를 입력해주세요."
				value={form.address}
				alarm={alarm}
				readOnly
				onClick={addressPopup}
				onBlur={validateForm}
				ref={(el) => {
					setAddressRef(el);
				}}
				cursorPointer={true}
				requiredMark={requiredMark}
				labelWidthPercent={labelWidthPercent}
				inputWidthPercent={inputWidthPercent}
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
					setAddressDetailRef(el);
				}}
				requiredMark={requiredMark}
				readOnly={addressDetailReadOnly}
				labelWidthPercent={labelWidthPercent}
				inputWidthPercent={inputWidthPercent}
			/>
		</>
	);
};
