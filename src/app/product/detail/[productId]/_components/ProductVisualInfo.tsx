import { ReviewStar } from "@/components/product/ReviewStar";
import { OptionSelector } from "@/components/ui/OptionSelector";
import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import { GoQuestion } from "react-icons/go";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import styles from "../ProductDetail.module.scss";
import { ImageFill } from "@/components/common/ImageFill";
import { calculateMileage, discountPercent, money } from "@/lib/format";
import { ProductOption } from "@/types/product";
import { useMemo, useState } from "react";

interface ProductVisualInfoProps {
	productDetail: {
		name: string;
		originPrice: number;
		finalPrice: number;
	};
	reviewCount: number;
	reviewRate: number;
	productOptionList: ProductOption[];
}

// 상품 사진 및 가격배송 정보
export default function ProductVisualInfo({ productDetail, reviewCount, reviewRate, productOptionList }: ProductVisualInfoProps) {
	// 제품 옵션 선택index
	const [pickIdx, setPickIdx] = useState(0);
	// 제품 옵션 들어갈 꺼
	const { optionInitData, optionSelectList } = useMemo(() => {
		const first = productOptionList[0];
		return {
			optionInitData: {
				id: first.productOptionId,
				val: first.size,
			},
			optionSelectList: productOptionList.map((v) => ({
				id: v.productOptionId,
				val: v.size,
			})),
		};
	}, [productOptionList]);

	return (
		<section className={styles.productVisualInfo}>
			<div className={styles.productImageArea}>
				<ImageFill />
			</div>

			<div className={styles.productTextInfo}>
				<div className={styles.productMetaInfo}>
					<div className={styles.productTitleWishlist}>
						<div className={styles.productName}>{productDetail.name}</div>
						<button className={styles.productWishlist}>
							<FaHeart />
						</button>
					</div>

					<div className={styles.productReviewSection}>
						<ReviewStar rate={reviewRate} size={15} />
						<Link href="">{reviewCount}개 리뷰보기</Link>
					</div>

					<div className={styles.productPriceInfo}>
						{/* 상품 자체 할인가격 */}
						<h6 className={styles.originalPrice}>{money(productDetail.originPrice)}원</h6>
						<p className={styles.firstPurchaseLabel}>첫 구매가</p>
						<div className={styles.priceDiscount}>
							<div className={styles.priceBox}>
								<b>{discountPercent(productDetail.originPrice, productDetail.finalPrice)}%</b>
								<strong>{money(productDetail.finalPrice)}원</strong>
							</div>

							<button className={styles.tooltipBtn}>
								<GoQuestion />
							</button>
						</div>
						{/* 쿠폰 적용가 */}
						<div className={styles.myPrice}>
							<div>
								<b>10%</b>
								<strong>52,200원</strong>
							</div>
							<button>
								나의 구매 가능 가격
								{true ? <IoIosArrowDown /> : <IoIosArrowUp />}
							</button>
						</div>
					</div>
				</div>

				<div className={styles.productAdditionalInfo}>
					<div className={styles.productMileage}>
						<b>구매 적립금</b>
						<span>최대 {calculateMileage(productDetail.finalPrice)} 마일리지 적립 예정</span>
					</div>

					<div className={styles.installmentInfo}>
						<b>무이자 할부</b>
						<div>
							<p>최대 7개월 무이자 할부 시 월 8,285원 결제</p>
							<div>
								<button>카드사별 할부 혜택 안내</button>
							</div>
						</div>
					</div>

					<div className={styles.deliveryInfo}>
						<b>
							배송정보
							<button>
								<GoQuestion />
							</button>
						</b>
						<span>
							예약 출고 <span>2025.05.30 이내 출고</span>
						</span>
					</div>

					<div className={styles.deliveryFeeInfo}>
						<b>배송비</b>
						<div>
							<p>2,500원</p>
							<p>30,000원 이상 구매시 무료배송</p>
							<p>제주/도서산간 3,000원 추가</p>
						</div>
					</div>
				</div>

				<div className={styles.productOptionBuy}>
					<div className={styles.productOptionSelect}>
						<OptionSelector
							optionSelectorName="productVisualOption"
							pickIdx={pickIdx}
							initData={optionInitData}
							optionList={optionSelectList}
							changeOption={(idx) => {
								setPickIdx(idx);
							}}
						/>
					</div>

					<div className={styles.actionButtons}>
						<button className={styles.btnCart}>장바구니 담기</button>
						<button className={styles.btnBuy}>바로 구매하기</button>
					</div>
				</div>
			</div>
		</section>
	);
}
