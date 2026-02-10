"use client";

import { ReviewStar } from "@/components/product/ReviewStar";
import { OptionSelector } from "@/components/ui/OptionSelector";
import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import { GoQuestion } from "react-icons/go";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import styles from "../ProductDetail.module.scss";
import { ImageFill } from "@/components/common/ImageFill";

// 상품 사진 및 가격배송 정보
export default function ProductVisualInfo() {
	return (
		<section id="product-visual-info">
			<div className={styles.productImageArea}>
				<ImageFill />
			</div>

			<div className={styles.productTextInfo}>
				<div className={styles.productMetaInfo}>
					<div className={styles.productTitleWishlist}>
						<div className={styles.productName}>Crown Raive Graphic T-shirt VW5ME601_3color</div>
						<button className={styles.productWishlist}>
							<FaHeart />
						</button>
					</div>

					<div className={styles.productReviewSection}>
						<ReviewStar rate={3.5} size={15} />
						<Link href="">274개 리뷰보기</Link>
					</div>

					<div className={styles.productPriceInfo}>
						<h6 className={styles.originalPrice}>58,000원</h6>
						<p className={styles.firstPurchaseLabel}>첫 구매가</p>

						<div className={styles.priceDiscount}>
							<div className={styles.priceBox}>
								<b>10%</b>
								<strong>52,200원</strong>
							</div>

							<button className={styles.tooltipBtn}>
								<GoQuestion />
							</button>
						</div>

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
						<span>최대 580 마일리지 적립 예정</span>
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
							pickIdx={0}
							initData={{ id: 1, val: "COLOR:SIZE" }}
							optionList={[
								{ id: 1, val: "COLOR:SIZE" },
								{ id: 2, val: "WHITE:0S" },
								{ id: 3, val: "WHITE:01S" },
							]}
							changeOption={(idx, id) => {}}
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
