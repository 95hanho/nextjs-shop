import Link from "next/link";
import styles from "./Complete.module.scss";

// 구매 완료 페이지
export default function BuyCompletePage() {
	return (
		<main id="buy-complete">
			<div className={styles.container}>
				<div className={styles.completeWrapper}>
					<h1>구매 성공</h1>
					<p>구매가 성공적으로 완료되었습니다.</p>
					<div className={styles.buttonWrapper}>
						<Link href="/mypage/order-history">주문 내역 보기</Link>
						<Link href="/">메인으로 돌아가기</Link>
					</div>
				</div>
			</div>
		</main>
	);
}
