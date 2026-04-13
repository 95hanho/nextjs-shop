import API_URL from "@/api/endpoints";
import { getNormal } from "@/api/fetchFilter";
import { FormInput } from "@/components/form/FormInput";
import { FormPageShell } from "@/components/form/FormPageShell";
import { InfoMark } from "@/components/form/InfoMark";
import { OptionSelector } from "@/components/ui/OptionSelector";
import { getApiUrl } from "@/lib/getBaseUrl";
import { ChangeEvent } from "@/types/event";
import { FormInputAlarm, FormInputRefs } from "@/types/form";
import { Menu, MenuResponse } from "@/types/main";
import { ProductColorName } from "@/types/product";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./ProductSet.module.scss";
import { DateInput } from "@/components/form/DateInput";
import { SellerProductDetail } from "@/types/seller";
import { ProductImageSet, ProductImageSetHandle } from "@/components/seller/product/ProductImageSet";
import { money } from "@/lib/format";
import clsx from "clsx";
import { FaExchangeAlt } from "react-icons/fa";
import { useSellerProductSubmit } from "@/hooks/query/seller/useSellerProductSubmit";
import { useGlobalDialogStore } from "@/store/globalDialog.store";

export type ProductSetForm = {
	name: string;
	colorName: ProductColorName;
	originPrice: number;
	finalPrice: number;
	gender: "M" | "F";
	menuTopId: number;
	menuSubId: number;
	saleStop?: boolean;
	/* --------- */
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
type RequiredProductSetForm = {
	name: string;
	colorName: ProductColorName;
	originPrice: number;
	finalPrice: number;
	menuSubId: number;
	menuTopId: number;
};
type ProductSetAlarm = FormInputAlarm<keyof RequiredProductSetForm>;
type ProductSetInputRefs = FormInputRefs<keyof RequiredProductSetForm>;

const initProductSetForm: ProductSetForm = {
	name: "",
	colorName: "BLACK",
	originPrice: 0,
	finalPrice: 0,
	gender: "M",
	menuTopId: 0,
	menuSubId: 0,
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
	productId?: number;
	prevProductSetData?: SellerProductDetail;
}

export const ProductSetForm = ({ productId, prevProductSetData }: ProductSetFormProps) => {
	const { openDialog } = useGlobalDialogStore();
	// ------------------------------------------------
	// React Query
	// ------------------------------------------------
	const { sellerProductSubmit } = useSellerProductSubmit();

	// 메뉴 카테고리 조회 getNormal<MenuResponse>(getBackendUrl(API_URL.MAIN_MENU));
	const { data: menuList } = useQuery<MenuResponse, Error, Menu[]>({
		queryKey: ["mainMenu"],
		queryFn: () => getNormal<MenuResponse>(getApiUrl(API_URL.MAIN_MENU)),
		select: (data) => data.menuList,
	});
	// 제품명 중복확인
	const { mutateAsync: checkProductNameDuplicate } = useMutation({
		mutationKey: ["productNameDuplicate"],
		mutationFn: async (productName: string) =>
			getNormal(getApiUrl(API_URL.SELLER_PRODUCT_NAME_DUPLICATE), {
				productName,
			}),
	});

	// ------------------------------------------------
	// React
	// ------------------------------------------------

	// 제품수정 폼
	const [productSetForm, setProductSetForm] = useState<ProductSetForm>(initProductSetForm);
	const [productSetAlarm, setProductSetAlarm] = useState<ProductSetAlarm | null>(null);
	const productSetInputRefs = useRef<Partial<ProductSetInputRefs>>({});
	//
	const productImageSetRef = useRef<ProductImageSetHandle | null>(null);

	// changeForm
	const changeProductSetForm = (e: ChangeEvent) => {
		const { name, value } = e.target;
		let changeVal: string | number = value;

		// 숫자만 허용해야하는 input은 숫자만 입력받도록
		if (["originPrice", "finalPrice"].includes(name)) {
			changeVal = changeVal.replace(/[^0-9]/g, "");
		}

		setProductSetAlarm(null);
		setProductSetForm((prev) => ({
			...prev,
			[name]: changeVal,
		}));
	};
	// 유효성 확인
	const validateProductSetForm = async (e: ChangeEvent) => {
		const { name, value } = e.target;
		let changeVal: string = value.trim();
		let changeAlarm: ProductSetAlarm | null = null;

		// 숫자만 허용해야하는 input은 숫자만 입력받도록
		if (["originPrice", "finalPrice"].includes(name)) {
			changeVal = changeVal.replace(/[^0-9]/g, "");
		}
		// 제품명 중복체크
		if (name === "name" && changeVal) {
			if (productSetAlarm?.message !== "이미 존재하는 제품명 입니다.") {
				await checkProductNameDuplicate(changeVal).catch((err) => {
					if (err.message === "SELLER_PRODUCT_NAME_DUPLICATED") {
						changeAlarm = { name: "name", message: "이미 존재하는 제품명 입니다.", status: "FAIL" };
					}
				});
			}
		}

		if (changeAlarm) setProductSetAlarm(changeAlarm);
		setProductSetForm((prev) => ({
			...prev,
			[name]: changeVal,
		}));
	};
	// 제품 추가/수정 버튼 클릭
	const handleSubmitProductSetForm = async () => {
		console.log("handleSubmitProductSetForm");

		// 알람 있으면 그대로 출력
		if (productSetAlarm?.status === "FAIL") {
			productSetInputRefs.current[productSetAlarm.name]?.focus();
			return;
		}
		//
		let changeAlarm: ProductSetAlarm | null = null;
		const alertKeys = Object.keys(productSetForm) as (keyof RequiredProductSetForm)[];
		for (const key of alertKeys) {
			if (!productSetInputRefs.current[key]) continue;
			const value = productSetForm[key];
			// 빈값 체크
			if (value === "") {
				changeAlarm = { name: key, message: "해당 내용을 입력해주세요.", status: "FAIL" };
			}
			// 숫자값들은 0보다 커야함.
			else if (["originPrice", "finalPrice"].includes(key) && Number(value) <= 0) {
				changeAlarm = { name: key, message: "값은 0보다 커야 합니다.", status: "FAIL" };
			}
			// 카테고리들은 0이면 안됨.
			else if (["menuSubId", "menuTopId"].includes(key) && Number(value) === 0) {
				changeAlarm = { name: key, message: "카테고리를 선택해주세요.", status: "FAIL" };
			}

			if (changeAlarm) break;
		}

		// 제품명 중복체크
		await checkProductNameDuplicate(productSetForm.name).catch((err) => {
			if (err.message === "SELLER_PRODUCT_NAME_DUPLICATED") {
				changeAlarm = { name: "name", message: "이미 존재하는 제품명 입니다.", status: "FAIL" };
			}
		});
		if (changeAlarm) {
		}
		// 원가 > 판매가
		else if (Number(productSetForm.originPrice) > Number(productSetForm.finalPrice)) {
			changeAlarm = { name: "finalPrice", message: "판매가는 원가보다 작아야 합니다.", status: "FAIL" };
		}

		if (changeAlarm) {
			setProductSetAlarm(changeAlarm);
			productSetInputRefs.current[changeAlarm.name]?.focus();
			return;
		}

		console.log("제품 추가/수정 API 요청");
		const imageSubmitData = productImageSetRef.current?.getSubmitData();
		console.log(imageSubmitData);
		if (!imageSubmitData) {
			openDialog("ALERT", {
				content: "이미지 데이터가 없습니다. 다시 시도해주세요.",
			});
		} else {
			sellerProductSubmit({
				productId,
				productSetForm,
				...imageSubmitData,
			});
		}
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
		if (prevProductSetData) {
			setProductSetForm({
				name: prevProductSetData.name,
				colorName: prevProductSetData.colorName,
				originPrice: prevProductSetData.originPrice,
				finalPrice: prevProductSetData.finalPrice,
				gender: prevProductSetData.gender,
				menuTopId: prevProductSetData.menuTopId,
				menuSubId: prevProductSetData.menuSubId,
				saleStop: prevProductSetData.saleStop,
				materialInfo: prevProductSetData.materialInfo || "",
				manufacturerName: prevProductSetData.manufacturerName || "",
				countryOfOrigin: prevProductSetData.countryOfOrigin || "",
				washCareInfo: prevProductSetData.washCareInfo || "",
				manufacturedYm: prevProductSetData.manufacturedYm || "",
				qualityGuaranteeInfo: prevProductSetData.qualityGuaranteeInfo || "",
				afterServiceContact: prevProductSetData.afterServiceContact || "",
				afterServiceManager: prevProductSetData.afterServiceManager || "",
				afterServicePhone: prevProductSetData.afterServicePhone || "",
			});
		}
	}, [prevProductSetData]);

	if (!menuList) return null;
	return (
		<main className={styles.productSetFormWrap}>
			<FormPageShell title={!productId ? "제품 등록" : "제품 수정"} formWidth={1100} wrapMinHeight={100} overflow="visible">
				<div className={styles.productSetContent}>
					<div className={styles.productSetForm}>
						<form onSubmit={handleSubmitProductSetForm}>
							{!productId ? (
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
								requiredMark
								infoVal={
									<span className={styles.optionSelectorWrap}>
										<OptionSelector
											pickIdx={
												!productSetForm.colorName
													? 0
													: productColorNameList.findIndex((v) => v === productSetForm.colorName) + 1
											}
											initData={
												!productId
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
								value={money(productSetForm.originPrice)}
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
								value={money(productSetForm.finalPrice)}
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
								title="성별"
								requiredMark
								infoVal={
									<span className={styles.genderOptionWrap}>
										<span>
											<label htmlFor="male" className="select-none">
												남성
											</label>
											<input
												type="radio"
												id="male"
												name="gender"
												value="M"
												checked={productSetForm.gender === "M"}
												onChange={(e) => {
													setProductSetAlarm(null);
													setProductSetForm((prev) => ({
														...prev,
														gender: e.target.value as "M" | "F",
														menuTopId: 0, // 성별 변경 시 상위 카테고리 초기화
														menuSubId: 0, // 성별 변경 시 하위 카테고리 초기화
													}));
												}}
											/>
										</span>
										<span>
											<label htmlFor="female" className="select-none">
												여성
											</label>
											<input
												type="radio"
												id="female"
												name="gender"
												value="F"
												checked={productSetForm.gender === "F"}
												onChange={(e) => {
													setProductSetAlarm(null);
													setProductSetForm((prev) => ({
														...prev,
														gender: e.target.value as "M" | "F",
														menuTopId: 0, // 성별 변경 시 상위 카테고리 초기화
													}));
												}}
											/>
										</span>
									</span>
								}
							/>
							<InfoMark
								title="카테고리"
								requiredMark
								infoVal={
									<span className={styles.optionSelectorWrap}>
										<OptionSelector
											ref={(el) => {
												productSetInputRefs.current.menuTopId = el;
											}}
											pickIdx={
												!productSetForm.menuTopId
													? 0
													: menuList.findIndex((v) => v.menuTopId === productSetForm.menuTopId) + 1
											}
											initData={
												!productId
													? { id: 0, val: "카테고리를 선택해주세요." }
													: {
															id: productSetForm.menuTopId,
															val: menuList.find((v) => v.menuTopId === productSetForm.menuTopId)?.menuName || "",
														}
											}
											optionList={[
												{ id: 0, val: "카테고리를 선택해주세요." },
												...menuList
													.filter((v) => v.gender === productSetForm.gender)
													.map((v) => ({
														id: v.menuTopId,
														val: v.menuName,
													})),
											]}
											optionSelectorName="productCategory"
											changeOption={(_, id) => {
												setProductSetAlarm(null);
												setProductSetForm((prev) => ({
													...prev,
													menuTopId: id,
													menuSubId: prev.menuTopId !== id ? 0 : prev.menuSubId, // 상위 카테고리 변경 시 하위 카테고리 초기화
												}));
											}}
										/>
										{productSetAlarm?.name === "menuTopId" && productSetAlarm.status === "FAIL" && (
											<p className={styles.alarmText}>* {productSetAlarm.message}</p>
										)}
									</span>
								}
								noMargin
							/>
							{!!productSetForm.menuTopId && (
								<InfoMark
									title="세부 카테고리"
									requiredMark
									infoVal={
										<span className={styles.optionSelectorWrap}>
											{menuList && (
												<OptionSelector
													ref={(el) => {
														productSetInputRefs.current.menuSubId = el;
													}}
													pickIdx={
														!productSetForm.menuSubId
															? 0
															: subMenuList.findIndex((v) => v.menuSubId === productSetForm.menuSubId) + 1
													}
													initData={
														!productId
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
														setProductSetAlarm(null);
														setProductSetForm((prev) => ({
															...prev,
															menuSubId: id,
														}));
													}}
												/>
											)}
											{productSetAlarm?.name === "menuSubId" && productSetAlarm.status === "FAIL" && (
												<p className={styles.alarmText}>* {productSetAlarm.message}</p>
											)}
										</span>
									}
									noMargin
								/>
							)}
							{productId && (
								<InfoMark
									title="판매여부"
									infoVal={
										<span className={clsx(productSetForm?.saleStop && styles.saleStop)}>
											{productSetForm?.saleStop ? "판매중지" : "판매중"}
											<button
												type="button"
												className={clsx(styles.changeButton)}
												onClick={() => {
													setProductSetForm({
														...productSetForm,
														saleStop: !productSetForm.saleStop,
													});
												}}
											>
												<FaExchangeAlt />
											</button>
										</span>
									}
								/>
							)}

							{/* --------------- 선택 사항 ----------------- */}
							<FormInput
								label="제품 소재"
								name="materialInfo"
								value={productSetForm.materialInfo}
								onChange={changeProductSetForm}
								onBlur={validateProductSetForm}
								placeholder="제품 소재를 입력해주세요."
								inputWidthPercent={80}
							/>
							<FormInput
								label="제조사"
								name="manufacturerName"
								value={productSetForm.manufacturerName}
								onChange={changeProductSetForm}
								onBlur={validateProductSetForm}
								placeholder="제조사를 입력해주세요."
								inputWidthPercent={80}
							/>
							<FormInput
								label="제조국"
								name="countryOfOrigin"
								value={productSetForm.countryOfOrigin}
								onChange={changeProductSetForm}
								onBlur={validateProductSetForm}
								placeholder="제조국을 입력해주세요."
								inputWidthPercent={80}
							/>
							<FormInput
								label="세탁 방법 및 주의사항"
								name="washCareInfo"
								value={productSetForm.washCareInfo}
								onChange={changeProductSetForm}
								onBlur={validateProductSetForm}
								placeholder="세탁 방법 및 주의사항을 입력해주세요."
								inputWidthPercent={80}
							/>
							<DateInput
								label="제조 연월"
								name="manufacturedYm"
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
							/>
							<FormInput
								label="품질보증기준"
								name="qualityGuaranteeInfo"
								value={productSetForm.qualityGuaranteeInfo}
								onChange={changeProductSetForm}
								onBlur={validateProductSetForm}
								placeholder="품질보증기준을 입력해주세요."
								inputWidthPercent={80}
							/>
							<FormInput
								label="A/S 책임자와 전화번호"
								name="afterServiceContact"
								value={productSetForm.afterServiceContact}
								onChange={changeProductSetForm}
								onBlur={validateProductSetForm}
								placeholder="A/S 책임자와 전화번호를 입력해주세요."
								inputWidthPercent={80}
							/>
							<FormInput
								label="(선택) A/S 책임자"
								name="afterServiceManager"
								value={productSetForm.afterServiceManager}
								onChange={changeProductSetForm}
								onBlur={validateProductSetForm}
								placeholder="A/S 책임자를 입력해주세요."
								inputWidthPercent={80}
							/>
							<FormInput
								label="(선택) A/S 전화번호"
								name="afterServicePhone"
								value={productSetForm.afterServicePhone}
								onChange={changeProductSetForm}
								onBlur={validateProductSetForm}
								placeholder="A/S 전화번호를 입력해주세요."
								inputWidthPercent={80}
							/>
						</form>
					</div>
					<ProductImageSet ref={productImageSetRef} prevImageList={prevProductSetData?.productImages} />
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
