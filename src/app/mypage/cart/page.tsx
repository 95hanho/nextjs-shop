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
						<div>
							<div>상품 금액</div>
							<div>185000</div>
						</div>
						<div>
							<div>할인 금액</div>
							<div>-39,960원</div>
						</div>
						<div>
							<div>배송비</div>
							<div>무료배송</div>
						</div>
						<div>
							<div>총 구매 금액</div>
							<div>145,040</div>
						</div>
						<div>
							<div>적립혜택 예상</div>
							<div>최대 5,120</div>
						</div>
						<hr />
						<div>
							<div>결제 혜택</div>
							<div>더보기</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
