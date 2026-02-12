"use client";

import { FaAngleDown, FaRegQuestionCircle } from "react-icons/fa";

export default function BuyClient() {
	return (
		<div>
			<h1>주문서</h1>
			<div>
				<div>
					<h2>
						<span>
							<span>배송 정보</span>
							<i>
								<FaRegQuestionCircle />
							</i>
						</span>
						<span>
							<i>*</i>
							<span>표시는 필수입력 항목</span>
						</span>
					</h2>
					<section>
						<ul>
							<li>기존배송지</li>
							<li>새로운배송지</li>
						</ul>
					</section>
				</div>
				<aside>
					<h2>결제 금액</h2>
					<article>
						<div>
							<div>총 상품 금액</div>
							<div>33,000원</div>
						</div>
						<div>
							<div>배송비</div>
							<div>3,000원</div>
						</div>
						<div>
							<div>쿠폰 할인 금액</div>
							<div>
								<span>36,000원</span>
								<i>
									<FaAngleDown />
								</i>
							</div>
						</div>
						<div>
							<div>보유 적립금 사용</div>
							<div>0원</div>
						</div>
						<div>
							<div>구매 적립금 선할인</div>
							<div>0원</div>
						</div>
						<div>
							<div>결제 즉시 할인</div>
							<div>0원</div>
						</div>
						<div>
							<strong>총 결제 금액</strong>
							<span>33,000원</span>
						</div>
					</article>
					<h2>적립 혜택</h2>
					<div>
						<span>총 적립 혜택</span>
						<strong>330원</strong>
					</div>
					<article>
						<div>주문 내용을 확인했으며, 아래 내용에 모두 동의합니다.</div>
						<div>
							<span>개인정보 수집/이용 동의</span>
							<button>보기</button>
						</div>
						<div>
							<span>개인정보 제3자 제공 동의</span>
							<button>보기</button>
						</div>
						<p>
							결제 및 계좌 안내 시 상호명은 <mark>NEXTJS-SHOP</mark>로 표기되니 참고 부탁드립니다.
						</p>
					</article>
					<footer>
						<div>
							<div>이번 주문으로 받는 혜택</div>
							<div>
								<span>36,000원</span>
								<i>
									<FaAngleDown />
								</i>
							</div>
						</div>
						<div>
							<button>30,300원 결제하기</button>
						</div>
					</footer>
				</aside>
			</div>
		</div>
	);
}
