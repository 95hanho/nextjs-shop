import styles from "./Buy.module.scss";
import { BsExclamationCircle } from "react-icons/bs";
import ShippingAddressForm from "@/app/buy/ShippingAddressForm";
import { AppliedProductCouponMap, BuyItemWishCoupon, CartCoupon, SellerCoupon } from "@/app/buy/BuyClient";
import { money } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { calculateDiscount } from "@/lib/price";
import { useEffect, useRef, useState } from "react";
import { scrollIntoCenter } from "@/utils/ui";
import BuyCouponSelector from "@/app/buy/BuyCouponSelector";
import clsx from "clsx";
import { useBuy } from "@/hooks/buy/useBuy";
import { MaxDiscountBanner } from "@/components/buy/MaxDiscountBanner";

interface OrderFormSectionProps {
	buyItemList: BuyItemWishCoupon[];
	cartCouponList: CartCoupon[];
	sellerCouponList: SellerCoupon[];
	isMaxDiscountApplied: boolean;
	appliedProductCouponMap: AppliedProductCouponMap;
	changeAppliedProductCoupon: (holdId: number, coupon: CartCoupon | SellerCoupon, isAdd: boolean) => void;
	changeMaxDiscountApplied: () => void; // 최대 할인 쿠폰 적용하기
	maxDiscountPrice: number; // 최대 할인 금액 (최대 할인 쿠폰이 적용됐을 때의 할인 금액)
	sumCouponDiscount: number; // 쿠폰 할인 금액 합
	//
	buyTotalFinalPrice: number;
}

export default function OrderFormSection({
	buyItemList,
	cartCouponList,
	sellerCouponList,
	isMaxDiscountApplied,
	appliedProductCouponMap,
	changeAppliedProductCoupon,
	changeMaxDiscountApplied,
	maxDiscountPrice,
	sumCouponDiscount,
	buyTotalFinalPrice,
}: OrderFormSectionProps) {
	// 1) [store / custom hooks] -----------------------------------
	const { user } = useAuth();
	const { usedMileage, setUsedMileage, changeUsedMileage, paymentMethod, setPaymentMethod } = useBuy();

	// 2) [useState / useRef] --------------------------------------
	// 쿠폰변경 UI 열기(판매자이름)
	const [couponAppliedSelectorOpenSeller, setCouponAppliedSelectorOpenSeller] = useState<string>("");
	// 열리는 버튼 요소에 ref를 저장
	const panelRef = useRef<HTMLElement | null>(null);
	// 열릴 때 닫힌 스크롤위치 저장
	const scrollYRef = useRef<number | null>(null);

	// 4) [derived values / useMemo] -------------------------------
	// 최대 할인 적용여부
	const isMaxDiscountStatus = isMaxDiscountApplied || sumCouponDiscount === maxDiscountPrice;

	// 6) [useEffect] ----------------------------------------------
	// 열림 상태가 바뀌면 다음 프레임에서 스크롤
	useEffect(() => {
		requestAnimationFrame(() => {
			if (couponAppliedSelectorOpenSeller) {
				if (panelRef.current) scrollIntoCenter(panelRef.current);
			} else if (scrollYRef.current !== null) {
				scrollTo({ top: scrollYRef.current, behavior: "instant" });
				scrollYRef.current = null;
			}
		});
	}, [couponAppliedSelectorOpenSeller]);

	return (
		<section className={styles.main}>
			{/* 배송 정보 */}
			<ShippingAddressForm />

			{/* 쿠폰 사용 및 상품 정보 */}
			<article className={styles.block}>
				<header className={styles.blockHeader}>
					<div className={styles.blockTitleRow}>
						<div className={styles.blockTitle}>쿠폰 사용 및 상품 정보 / 총 {buyItemList.length}개</div>
					</div>
				</header>

				{sumCouponDiscount > 0 && (
					<MaxDiscountBanner isMaxDiscountStatus={isMaxDiscountStatus} changeMaxDiscountApplied={changeMaxDiscountApplied} />
				)}

				{buyItemList.map((item) => {
					const initialOriginPrice = (item.originPrice + item.addPrice) * item.count;
					const initialFinalPrice = (item.finalPrice + item.addPrice) * item.count;

					// 해당 상품에 적용 가능한 장바구니 쿠폰 리스트
					const availableCartCoupons = cartCouponList.filter(
						(coupon) =>
							((coupon.isProductRestricted && coupon.couponAllowedId && coupon.productId === item.productId) ||
								(!coupon.isProductRestricted && !coupon.couponAllowedId)) &&
							calculateDiscount(initialFinalPrice, coupon) !== null,
					);

					// const isDiscountApplied = calculateDiscount(finalXCount, coupon);
					// 해당 상품에 적용 가능한 판매자 쿠폰 리스트
					const availableProductCoupons = sellerCouponList.filter(
						(coupon) =>
							((coupon.isProductRestricted && coupon.couponAllowedId && coupon.productId === item.productId) ||
								(!coupon.isProductRestricted && !coupon.couponAllowedId)) &&
							calculateDiscount(initialFinalPrice, coupon) !== null,
					);
					// console.log({ name: item.productName, availableProductCoupons });
					// 적용 가능한 쿠폰 갯수
					const availableProductCouponCount = availableProductCoupons.length + availableCartCoupons.length;

					// 해당 상품에 적용된 쿠폰 정보 가져오기
					const appliedProductCoupon = appliedProductCouponMap[item.holdId];
					// 적용된 쿠폰 중에 장바구니 쿠폰
					const appliedCartCoupons = [];
					// 적용된 쿠폰 중에 판매자 쿠폰
					const appliedSellerCoupons = [];
					if (appliedProductCoupon) {
						if (appliedProductCoupon.unStackable) {
							if ("sellerName" in appliedProductCoupon.unStackable) {
								appliedSellerCoupons.push(appliedProductCoupon.unStackable);
							} else {
								appliedCartCoupons.push(appliedProductCoupon.unStackable);
							}
						}
						if (appliedProductCoupon.stackable.length > 0) {
							appliedProductCoupon.stackable.forEach((coupon) => {
								if ("sellerName" in coupon) {
									appliedSellerCoupons.push(coupon);
								} else {
									appliedCartCoupons.push(coupon);
								}
							});
						}
					}
					// 쿠폰이 하나라도 적용이 됐는지 여부
					const appliedCouponCount = !appliedProductCoupon
						? 0
						: appliedProductCoupon?.stackable.length + (appliedProductCoupon?.unStackable ? 1 : 0);

					return (
						<div key={"buyItem-" + item.holdId} className={styles.productCard}>
							<div className={styles.productRow}>
								<div className={styles.thumb} />

								<div className={styles.productInfo}>
									<a className={styles.brandLink} href="">
										{item.sellerName}
									</a>
									<h3 className={styles.productName}>{item.productName}</h3>

									<div>
										<del>{money(initialOriginPrice)}원</del>
									</div>
									<div className={styles.productPriceRow}>
										<span className={styles.productBase}>
											{money(initialFinalPrice)}원 / 수량 {item.count}개
										</span>
										<mark className={styles.productApplied}>쿠폰적용가 : {money(item.discountedPrice)}원</mark>
									</div>

									<div className={styles.couponBox}>
										{appliedSellerCoupons.length === 0 && appliedCartCoupons.length === 0 && (
											<div>
												<span className={styles.couponDesc}>적용된 쿠폰이 없습니다.</span>
											</div>
										)}
										{appliedSellerCoupons.length > 0 && (
											<div className={styles.couponLine}>
												<span className={styles.couponLabel}>상품 쿠폰</span>
												<div className={styles.couponAppliedList}>
													{appliedSellerCoupons.map((coupon) => (
														<div key={"buyAppliedCoupon-" + coupon.couponId} className={styles.couponApplied}>
															<span className={styles.couponDesc}>{coupon.description}</span>
															<span
																className={styles.couponPrice}
															>{`-${money(calculateDiscount(initialFinalPrice, coupon) as number)}`}</span>
														</div>
													))}
												</div>
											</div>
										)}
										{appliedCartCoupons.length > 0 && (
											<div className={styles.couponLine}>
												<span className={styles.couponLabel}>장바구니 쿠폰</span>
												<div className={styles.couponAppliedList}>
													{appliedCartCoupons.map((coupon) => (
														<div key={"buyAppliedCoupon-" + coupon.couponId} className={styles.couponApplied}>
															<span className={styles.couponDesc}>{coupon.description}</span>
															<span
																className={styles.couponPrice}
															>{`-${money(calculateDiscount(initialFinalPrice, coupon) as number)}원`}</span>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								</div>
							</div>

							<div className={styles.couponSummary}>
								<div className={styles.summaryRow}>
									<span className={styles.summaryLabel}>쿠폰 할인 금액</span>
									<span className={styles.summaryValueMinus}>
										{item.discountAmount > 0 ? `-${money(item.discountAmount)}원` : "0원"}
									</span>
								</div>

								<>
									{availableProductCouponCount > 0 ? (
										<button
											className={clsx(styles.outlineBtn)}
											onClick={(e) => {
												if (couponAppliedSelectorOpenSeller === item.sellerName) {
													setCouponAppliedSelectorOpenSeller("");
												} else {
													panelRef.current = e.currentTarget;
													scrollYRef.current = window.scrollY;
													setCouponAppliedSelectorOpenSeller(item.sellerName);
												}
											}}
										>
											{couponAppliedSelectorOpenSeller === item.sellerName
												? "닫기"
												: appliedCouponCount > 0
													? `쿠폰 변경(${appliedCouponCount})`
													: "쿠폰 사용"}
										</button>
									) : (
										<button className={clsx(styles.outlineBtn, "bg-gray-200", "opacity-60")}>적용 가능 쿠폰 없음</button>
									)}
								</>
							</div>
							{couponAppliedSelectorOpenSeller === item.sellerName && (
								<div className={styles.productItemAppliedCouponList}>
									<div className={styles.appliedCouponListTitle}>
										{availableProductCoupons.length > 0 && (
											<div className="mb-2">
												<h4 className="mb-1 text-gray-500">상품 쿠폰 할인</h4>
												{availableProductCoupons.map((coupon) => {
													// 중복불가 쿠폰일 시 검사
													const unStackableChecked =
														!coupon.isStackable && appliedProductCoupon?.unStackable?.couponId === coupon.couponId;
													// 중복가능 쿠폰일 시 검사
													const stackableChecked =
														coupon.isStackable &&
														appliedProductCoupon?.stackable?.some((c) => c.couponId === coupon.couponId);
													// checked 여부
													const couponChecked = unStackableChecked || stackableChecked;
													// 다른 쿠폰이 사용중
													const otherUsed = !couponChecked && coupon.used;

													return (
														<BuyCouponSelector
															key={"BuyCouponSelector-" + coupon.couponId}
															coupon={coupon}
															couponChecked={couponChecked || false}
															finalXCount={initialFinalPrice}
															handleCheckAppliedProductCoupon={(isAdd) => {
																console.log({ holdId: item.holdId });
																changeAppliedProductCoupon(item.holdId, coupon, isAdd);
															}}
															otherUsed={otherUsed}
															productOptionId={item.productOptionId}
														/>
													);
												})}
											</div>
										)}

										{availableCartCoupons.length > 0 && (
											<div>
												<h4 className="mb-1 text-gray-500">장바구니 쿠폰 할인</h4>
												{availableCartCoupons.map((coupon) => {
													// 중복불가 쿠폰일 시 검사
													const unStackableChecked =
														!coupon.isStackable && appliedProductCoupon?.unStackable?.couponId === coupon.couponId;
													// 중복가능 쿠폰일 시 검사
													const stackableChecked =
														coupon.isStackable &&
														appliedProductCoupon?.stackable?.some((c) => c.couponId === coupon.couponId);
													// checked 여부
													const couponChecked = unStackableChecked || stackableChecked;
													const otherUsed = !couponChecked && coupon.used;

													return (
														<BuyCouponSelector
															key={"BuyCouponSelector-" + coupon.couponId}
															coupon={coupon}
															couponChecked={couponChecked || false}
															finalXCount={initialFinalPrice}
															handleCheckAppliedProductCoupon={(isAdd) => {
																changeAppliedProductCoupon(item.holdId, coupon, isAdd);
															}}
															otherUsed={otherUsed}
															productOptionId={item.productOptionId}
														/>
													);
												})}
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					);
				})}
			</article>

			{/* 보유 적립금 사용 */}
			<article className={styles.block}>
				<header className={styles.blockHeader}>
					<div className={styles.blockTitleRow}>
						<div className={styles.blockTitle}>
							<span>보유 적립금 사용</span>
							<i className={styles.iconMuted}>
								<BsExclamationCircle />
							</i>
						</div>
					</div>
				</header>

				<div className={styles.pointRow}>
					<div className={styles.pointLabel}>사용 금액 입력</div>

					<div className={styles.pointField}>
						<div className={styles.pointInputRow}>
							<input
								className={styles.pointInput}
								type="text"
								value={money(usedMileage)}
								onChange={(e) => {
									changeUsedMileage(e, Math.min(buyTotalFinalPrice, user.mileage));
								}}
							/>
							<button
								type="button"
								className={styles.allUseBtn}
								onClick={() => setUsedMileage(Math.min(buyTotalFinalPrice, user.mileage))}
							>
								모두 사용
							</button>
						</div>
						<div>
							<span className={styles.pointText}>
								사용 가능 {money(Math.min(buyTotalFinalPrice, user.mileage))}원 / 보유 {money(user.mileage)}원
							</span>
						</div>
					</div>
				</div>
			</article>

			{/* 결제 방법 (2개만) */}
			<article id="paymentMethod" className={styles.block}>
				<header className={styles.blockHeader}>
					<div className={styles.blockTitleRow}>
						<div className={styles.blockTitle}>결제 방법</div>
					</div>
				</header>

				<div className={styles.payList}>
					<label className={styles.payItem}>
						<input type="radio" name="pay" checked={paymentMethod === "CARD"} onChange={() => setPaymentMethod("CARD")} />
						<span>신용카드</span>
					</label>

					<label className={styles.payItem}>
						<input type="radio" name="pay" checked={paymentMethod === "CASH"} onChange={() => setPaymentMethod("CASH")} />
						<span>계좌이체</span>
					</label>
				</div>
			</article>
		</section>
	);
}
