"use client";

import { FormPageShell } from "@/components/form/FormPageShell";
import { InfoMark } from "@/components/form/InfoMark";
import { useSellerAuth } from "@/hooks/context/useSellerAuth";

export default function SellerInfoClient() {
	const { seller } = useSellerAuth();

	if (!seller.sellerName) return null;
	return (
		<FormPageShell title="판매자 정보" wrapMinHeight={100} formWidth={550}>
			<InfoMark title="이름" infoVal={<span>{seller.sellerName}</span>} />
			<InfoMark title="이름(영문)" infoVal={<span>{seller.sellerNameEn}</span>} />
			<InfoMark title="내선번호" infoVal={<span>{seller.extensionNumber.replace(/(\d{2})(\d{2})(\d{2})/, "$1-$2-$3")}</span>} />
			<InfoMark title="대표번호" infoVal={<span>{seller.mobileNumber.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")}</span>} />
			<InfoMark title="이메일" infoVal={<span>{seller.email}</span>} />
			<InfoMark title="사업자 등록번호" infoVal={<span>{seller.businessRegistrationNumber}</span>} />
			<InfoMark title="통신 판매자번호" infoVal={<span>{seller.telecomSalesNumber}</span>} />
			<InfoMark title="대표자이름" infoVal={<span>{seller.representativeName}</span>} />
			<InfoMark
				title="사업 소재지 주소"
				infoVal={
					<span>
						({seller.businessZipcode}){seller.businessAddress}
					</span>
				}
			/>
			<InfoMark title="사업 소재지 상세주소" infoVal={<span>{seller.businessAddressDetail}</span>} />
			<p className="text-red-600">* 수정은 관리자에게 문의해주세요.</p>
		</FormPageShell>
	);
}
