import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { FormInput } from "@/components/form/FormInput";
import { FormPageShell } from "@/components/form/FormPageShell";
import { InfoMark } from "@/components/form/InfoMark";
import { OptionSelector } from "@/components/ui/OptionSelector";
import { getApiUrl } from "@/lib/getBaseUrl";
import { ChangeEvent, FormEvent } from "@/types/event";
import { FormInputAlarm, FormInputRefs } from "@/types/form";
import { Menu, MenuResponse } from "@/types/main";
import { ProductColorName } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ProductSet.module.scss";
import { DateInput } from "@/components/form/DateInput";
import DatePicker from "react-datepicker";
import { SellerProductDetail } from "@/types/seller";
import { ProductImageSet } from "@/components/seller/product/ProductImageSet";

type ProductSetForm = {
	name: string;
	colorName: ProductColorName;
	originPrice: number;
	finalPrice: number;
	menuSubId: number;
	menuTopId: number;
	gender: "M" | "F" | "";
	materialInfo: string;
	manufacturerName: string;
	countryOfOrigin: string;
	washCareInfo: string;
	manufacturedYm: string;
	qualityGuaranteeInfo: string;
	afterServiceContact: string;
	afterServiceManager: string;
	afterServicePhone: string;
};
type ProductSetAlarm = FormInputAlarm<keyof ProductSetForm>;
type ProductSetInputRefs = FormInputRefs<keyof Omit<ProductSetForm, "manufacturedYm">> & {
	manufacturedYm: DatePicker | null;
};

const initProductSetForm: ProductSetForm = {
	name: "",
	colorName: "BLACK",
	originPrice: 0,
	finalPrice: 0,
	menuSubId: 0,
	menuTopId: 0,
	gender: "",
	materialInfo: "",
	manufacturerName: "",
	countryOfOrigin: "",
	washCareInfo: "",
	manufacturedYm: "",
	qualityGuaranteeInfo: "",
	afterServiceContact: "",
	afterServiceManager: "",
	afterServicePhone: "",
};
const productColorNameList = [
	"BLACK",
	"WHITE",
	"RED",
	"YELLOW",
	"GREEN",
	"BLUE",
	"SKYBLUE",
	"PURPLE",
	"BROWN",
	"IVORY",
	"CHARCOAL",
	"DENIM",
] as ProductColorName[];

interface ProductSetFormProps {
	productId: number;
	prevProductSetData?: SellerProductDetail;
}

export const ProductSetForm = ({ productId, prevProductSetData }: ProductSetFormProps) => {
	// ------------------------------------------------
	// React Query
	// ------------------------------------------------

	// 메뉴 카테고리 조회 getNormal<MenuResponse>(getBackendUrl(API_URL.MAIN_MENU));
	const { data: menuList } = useQuery<MenuResponse, Error, Menu[]>({
		queryKey: ["mainMenu"],
		queryFn: () => getNormal<MenuResponse>(getApiUrl(API_URL.MAIN_MENU)),
		select: (data) => data.menuList,
	});
	// 제품 추가
	// 제품 수정
	// 제품 삭제

	// ------------------------------------------------
	// React
	// ------------------------------------------------

	// 제품수정 폼
	const [productSetForm, setProductSetForm] = useState<ProductSetForm>(prevProductSetData || initProductSetForm);
	const [productSetAlarm, setProductSetAlarm] = useState<ProductSetAlarm | null>(null);
	const productSetInputRefs = useRef<Partial<ProductSetInputRefs>>({});

	// 알람이 있을 때 해당 input으로 focus | 날짜는 datepicker 열기
	const focusCouponField = (name: keyof ProductSetForm | "manufacturedYm", refs: React.MutableRefObject<Partial<ProductSetInputRefs>>) => {
		const target = refs.current[name];

		if (!target) return;

		if ("setFocus" in target) {
			target.setFocus();
			target.setOpen?.(true);
			return;
		}

		target.focus();
	};

	// changeForm
	const changeProductSetForm = (e: ChangeEvent) => {
		const { name, value } = e.target;
		const changeValue: string | number = value;

		setProductSetAlarm(null);
		setProductSetForm((prev) => ({
			...prev,
			[name]: changeValue,
		}));
	};
	// 유효성 확인
	const validateProductSetForm = (e: ChangeEvent) => {
		const { name, value } = e.target;
		const changeVal: string = value.trim();
		const chnageAlarm: ProductSetAlarm | null = null;

		setProductSetAlarm(null);
		setProductSetForm((prev) => ({
			...prev,
			[name]: changeVal,
		}));
	};
	// 제품 추가/수정 버튼 클릭
	const handleSubmitProductSetForm = () => {
		console.log("handleSubmitProductSetForm");

		// 알람 있으면 그대로 출력
		if (productSetAlarm?.status === "FAIL") {
			focusCouponField(productSetAlarm.name, productSetInputRefs);
			return;
		}
		//
		let changeAlarm: ProductSetAlarm | null = null;
		const alertKeys = Object.keys(productSetForm) as (keyof ProductSetForm)[];
		for (const key of alertKeys) {
			if (!productSetInputRefs.current[key]) continue;
			const value = productSetForm[key];
			// 빈값 체크
			if (!value) {
				changeAlarm = { name: key, message: "해당 내용을 입력해주세요.", status: "FAIL" };
			}

			if (changeAlarm) break;
		}

		if (changeAlarm) {
			setProductSetAlarm(changeAlarm);
			focusCouponField(changeAlarm.name, productSetInputRefs);
			return;
		}

		console.log("제품 추가/수정 API 요청");
	};

	// ------------------------------------------------
	// useEffect, useMemo
	// ------------------------------------------------

	const { subMenuList } = useMemo(() => {
		return {
			subMenuList: menuList?.find((v) => v.menuTopId === productSetForm.menuTopId)?.menuSubList || [],
		};
	}, [menuList, productSetForm.menuTopId]);

	useEffect(() => {
		console.log({ subMenuList });
	}, [subMenuList]);

	if (!menuList) return null;
	return (
		<main className={styles.productSetFormWrap}>
			<FormPageShell title={!prevProductSetData ? "제품 등록" : "제품 수정"} formWidth={1100} wrapMinHeight={100} overflow="visible">
				<div className={styles.productSetContent}>
					<div className={styles.productSetForm}>
						<form onSubmit={handleSubmitProductSetForm}>
							{!prevProductSetData ? (
								<FormInput
									label="제품명"
									name="name"
									value={productSetForm.name}
									onChange={changeProductSetForm}
									onBlur={validateProductSetForm}
									alarm={productSetAlarm}
									ref={(el) => {
										productSetInputRefs.current.name = el;
									}}
									placeholder="제품명을 입력해주세요."
									requiredMark
									inputWidthPercent={80}
								/>
							) : (
								<InfoMark title="제품명" infoVal={<span>{productSetForm.name}</span>} />
							)}
							<InfoMark
								title="색상"
								infoVal={
									<span className={styles.optionSelectorWrap}>
										<OptionSelector
											pickIdx={
												!productSetForm.colorName
													? 0
													: productColorNameList.findIndex((v) => v === productSetForm.colorName) + 1
											}
											initData={
												!prevProductSetData
													? { id: 0, val: "색상을 선택해주세요." }
													: {
															id: productColorNameList.findIndex((v) => v === productSetForm.colorName) + 1,
															val: productSetForm.colorName,
														}
											}
											optionList={[
												{ id: 0, val: "색상을 선택해주세요." },
												...productColorNameList.map((v, idx) => ({
													id: idx + 1,
													val: v,
												})),
											]}
											optionSelectorName="productColorName"
											changeOption={(pickIdx, id) => {
												console.log({ pickIdx, id });
												setProductSetForm((prev) => ({
													...prev,
													colorName: productColorNameList[id - 1],
												}));
											}}
										/>
									</span>
								}
								noMargin
							/>
							<FormInput
								label="원가"
								name="originPrice"
								value={productSetForm.originPrice}
								onChange={changeProductSetForm}
								onBlur={validateProductSetForm}
								alarm={productSetAlarm}
								ref={(el) => {
									productSetInputRefs.current.originPrice = el;
								}}
								placeholder="원가를 입력해주세요."
								requiredMark
								inputWidthPercent={80}
							/>
							<FormInput
								label="판매가"
								name="finalPrice"
								value={productSetForm.finalPrice}
								onChange={changeProductSetForm}
								onBlur={validateProductSetForm}
								alarm={productSetAlarm}
								ref={(el) => {
									productSetInputRefs.current.finalPrice = el;
								}}
								placeholder="판매가를 입력해주세요."
								requiredMark
								inputWidthPercent={80}
							/>
							<InfoMark
								title="카테고리"
								infoVal={
									<span className={styles.optionSelectorWrap}>
										<OptionSelector
											pickIdx={
												!productSetForm.menuTopId
													? 0
													: menuList.findIndex((v) => v.menuTopId === productSetForm.menuTopId) + 1
											}
											initData={
												!prevProductSetData
													? { id: 0, val: "카테고리를 선택해주세요." }
													: {
															id: productSetForm.menuTopId,
															val: menuList.find((v) => v.menuTopId === productSetForm.menuTopId)?.menuName || "",
														}
											}
											optionList={[
												{ id: 0, val: "카테고리를 선택해주세요." },
												...menuList.map((v) => ({
													id: v.menuTopId,
													val: v.menuName,
												})),
											]}
											optionSelectorName="productCategory"
											changeOption={(_, id) => {
												setProductSetForm((prev) => ({
													...prev,
													menuTopId: id,
													menuSubId: prev.menuTopId !== id ? 0 : prev.menuSubId, // 상위 카테고리 변경 시 하위 카테고리 초기화
												}));
											}}
										/>
									</span>
								}
								noMargin
							/>
							{productSetForm.menuTopId && (
								<InfoMark
									title="세부 카테고리"
									infoVal={
										<span className={styles.optionSelectorWrap}>
											{menuList && (
												<OptionSelector
													pickIdx={
														!productSetForm.menuSubId
															? 0
															: subMenuList.findIndex((v) => v.menuSubId === productSetForm.menuSubId) + 1
													}
													initData={
														!prevProductSetData
															? { id: 0, val: "세부 카테고리를 선택해주세요." }
															: {
																	id: productSetForm.menuSubId,
																	val:
																		subMenuList.find((v) => v.menuSubId === productSetForm.menuSubId)?.menuName ||
																		"",
																}
													}
													optionList={[
														{ id: 0, val: "세부 카테고리를 선택해주세요." },
														...subMenuList.map((v) => ({
															id: v.menuSubId,
															val: v.menuName,
														})),
													]}
													optionSelectorName="productCategorySub"
													changeOption={(_, id) => {
														setProductSetForm((prev) => ({
															...prev,
															menuSubId: id,
														}));
													}}
												/>
											)}
										</span>
									}
									noMargin
								/>
							)}
							<InfoMark
								title="성별"
								infoVal={
									<span className={styles.genderOptionWrap}>
										<span>
											<label htmlFor="male">남성</label>
											<input
												type="radio"
												id="male"
												name="gender"
												value="M"
												checked={productSetForm.gender === "M"}
												onChange={changeProductSetForm}
											/>
										</span>
										<span>
											<label htmlFor="female">여성</label>
											<input
												type="radio"
												id="female"
												name="gender"
												value="F"
												checked={productSetForm.gender === "F"}
												onChange={changeProductSetForm}
											/>
										</span>
									</span>
								}
							/>
							{productSetAlarm?.name === "gender" && productSetAlarm.status === "FAIL" && (
								<p className="text-red-600">{productSetAlarm.message}</p>
							)}
							<FormInput
								label="제품 소재"
								name="materialInfo"
								value={productSetForm.materialInfo}
								onChange={changeProductSetForm}
								onBlur={validateProductSetForm}
								alarm={productSetAlarm}
								ref={(el) => {
									productSetInputRefs.current.materialInfo = el;
								}}
								placeholder="제품 소재를 입력해주세요."
								requiredMark
								inputWidthPercent={80}
							/>
							<FormInput
								label="제조사"
								name="manufacturerName"
								value={productSetForm.manufacturerName}
								onChange={changeProductSetForm}
								onBlur={validateProductSetForm}
								alarm={productSetAlarm}
								ref={(el) => {
									productSetInputRefs.current.manufacturerName = el;
								}}
								placeholder="제조사를 입력해주세요."
								requiredMark
								inputWidthPercent={80}
							/>
							<FormInput
								label="제조국"
								name="countryOfOrigin"
								value={productSetForm.countryOfOrigin}
								onChange={changeProductSetForm}
								onBlur={validateProductSetForm}
								alarm={productSetAlarm}
								ref={(el) => {
									productSetInputRefs.current.countryOfOrigin = el;
								}}
								placeholder="제조국을 입력해주세요."
								requiredMark
								inputWidthPercent={80}
							/>
							<FormInput
								label="세탁 방법 및 주의사항"
								name="washCareInfo"
								value={productSetForm.washCareInfo}
								onChange={changeProductSetForm}
								onBlur={validateProductSetForm}
								alarm={productSetAlarm}
								ref={(el) => {
									productSetInputRefs.current.washCareInfo = el;
								}}
								placeholder="세탁 방법 및 주의사항을 입력해주세요."
								requiredMark
								inputWidthPercent={80}
							/>
							<DateInput
								label="제조 연월"
								name="manufacturedYm"
								alarm={productSetAlarm}
								selectedDate={productSetForm.manufacturedYm ? new Date(productSetForm.manufacturedYm) : null}
								changeDate={(date) => {
									setProductSetAlarm(null);
									if (date) {
										setProductSetForm((prev) => ({
											...prev,
											manufacturedYm: date.toISOString(),
										}));
									}
								}}
								ref={(el) => {
									productSetInputRefs.current.manufacturedYm = el;
								}}
							/>
							<FormInput
								label="품질보증기준"
								name="qualityGuaranteeInfo"
								value={productSetForm.qualityGuaranteeInfo}
								onChange={changeProductSetForm}
								onBlur={validateProductSetForm}
								alarm={productSetAlarm}
								ref={(el) => {
									productSetInputRefs.current.qualityGuaranteeInfo = el;
								}}
								placeholder="품질보증기준을 입력해주세요."
								requiredMark
								inputWidthPercent={80}
							/>
							<FormInput
								label="A/S 책임자와 전화번호"
								name="afterServiceContact"
								value={productSetForm.afterServiceContact}
								onChange={changeProductSetForm}
								onBlur={validateProductSetForm}
								alarm={productSetAlarm}
								ref={(el) => {
									productSetInputRefs.current.afterServiceContact = el;
								}}
								placeholder="A/S 책임자와 전화번호를 입력해주세요."
								requiredMark
								inputWidthPercent={80}
							/>
							<FormInput
								label="(선택) A/S 책임자"
								name="afterServiceManager"
								value={productSetForm.afterServiceManager}
								onChange={changeProductSetForm}
								onBlur={validateProductSetForm}
								alarm={productSetAlarm}
								ref={(el) => {
									productSetInputRefs.current.afterServiceManager = el;
								}}
								placeholder="A/S 책임자를 입력해주세요."
								inputWidthPercent={80}
							/>
							<FormInput
								label="(선택) A/S 전화번호"
								name="afterServicePhone"
								value={productSetForm.afterServicePhone}
								onChange={changeProductSetForm}
								onBlur={validateProductSetForm}
								alarm={productSetAlarm}
								ref={(el) => {
									productSetInputRefs.current.afterServicePhone = el;
								}}
								placeholder="A/S 전화번호를 입력해주세요."
								inputWidthPercent={80}
							/>
						</form>
					</div>
					<ProductImageSet prevImageList={prevProductSetData?.productImages} />
				</div>
				<div className={styles.formActionWrap}>
					<button
						onClick={() => {
							handleSubmitProductSetForm();
						}}
					>
						저장하기
					</button>
				</div>
			</FormPageShell>
		</main>
	);
};
