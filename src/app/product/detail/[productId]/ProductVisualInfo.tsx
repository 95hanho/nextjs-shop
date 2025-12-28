"use client";

import ReviewStar from "@/components/product/ReviewStar";
import TestImage from "@/components/test/TestImage";
import OptionSelector from "@/components/ui/OptionSelector";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { GoQuestion } from "react-icons/go";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

export default function ProductVisualInfo() {
	return (
		<>
			{/* 상품 사진 및 가격배송 정보 */}
			<section id="product-visual-info">
				<div className="product-image-area">
					<TestImage />
				</div>
				<div className="product-text-info">
					<div className="product-meta-info">
						<div className="product-title-wishlist">
							<div className="product-name">Crown Raive Graphic T-shirt VW5ME601_3color</div>
							<div className="product-wishlist">
								<FaHeart />
							</div>
						</div>
						<div className="product-review-section">
							<ReviewStar />
							<Link href="">274개 리뷰보기</Link>
						</div>
						<div className="product-price-info">
							<h6 className="original-price">58,000원</h6>
							<p className="first-purchase-label">첫 구매가</p>
							<div className="price-discount">
								<div className="price-box">
									<b>10%</b>
									<strong>52,200원</strong>
								</div>
								<button className="tooltip-btn">
									<GoQuestion />
								</button>
							</div>
							<div className="my-price">
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
					<div className="product-additional-info">
						<div className="product-mileage">
							<b>구매 적립금</b>
							<span>최대 580 마일리지 적립 예정</span>
						</div>
						<div className="installment-info">
							<b>무이자 할부</b>
							<div>
								<p>최대 7개월 무이자 할부 시 월 8,285원 결제</p>
								<div>
									<button>카드사별 할부 혜택 안내</button>
								</div>
							</div>
						</div>
						<div className="delivery-info">
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
						<div className="delivery-fee-info">
							<b>배송비</b>
							<div>
								<p>2,500원</p>
								<p>30,000원 이상 구매시 무료배송</p>
								<p>제주/도서산간 3,000원 추가</p>
							</div>
						</div>
					</div>
					<div className="product-option-buy">
						<OptionSelector
							optionSelectorName="productVisualOption"
							pickIdx={0}
							initData={{
								id: 1,
								val: "COLOR:SIZE",
							}}
							optionList={[
								{
									id: 1,
									val: "COLOR:SIZE",
								},
								{
									id: 2,
									val: "WHITE:0S",
								},
								{
									id: 3,
									val: "WHITE:01S",
								},
							]}
							changeOption={(id) => {}}
						/>
						<div className="action-buttons">
							<button className="btn-cart">장바구니 담기</button>
							<button className="btn-buy">바로 구매하기</button>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
