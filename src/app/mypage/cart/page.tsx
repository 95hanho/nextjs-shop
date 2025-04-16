export default function Cart() {
	return (
		<main id="cart">
			<h1>장바구니 페이지 제작중</h1>
			<div className="cart-wrap">
				<div className="product-wrap">
					<div className="product-outline">
						<div>
							<div>전체 선택</div>
							<div>선택 삭제</div>
						</div>
						<div>
							<div>피렌체 아뜨리에</div>
							<div>브랜드샵으로</div>
						</div>
					</div>
				</div>
				<div className="price-wrap">
					<div className="price-outline">
						<div className="title">구매금액</div>
						<div className="price-line">
							<div className="info-name">상품 금액</div>
							<div className="price-num">185,000</div>
						</div>
						<div className="price-line">
							<div>할인 금액</div>
							<div className="text-blue-700">-39,960원</div>
						</div>
						<div className="price-line">
							<div>배송비</div>
							<div className="text-blue-700">무료배송</div>
						</div>
						<div className="price-line font-bold mt-4">
							<div>총 구매 금액</div>
							<div>
								<span className="align-baseline mr-2 text-red-500">22%</span>
								<span className="align-baseline">145,040</span>
							</div>
						</div>
						<div className="price-line">
							<div>적립혜택 예상</div>
							<div>최대 5,120</div>
						</div>
						<hr />
						<div className="title">
							<div>결제 혜택</div>
							<div className="text-sm">
								<a href="#" className="text-gray-600 underline">
									더보기
								</a>
							</div>
						</div>
					</div>
					<div>
						<button>145,040원 구매하기 (1개)</button>
					</div>
				</div>
			</div>
		</main>
	);
}
