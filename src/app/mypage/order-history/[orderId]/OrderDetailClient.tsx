import styles from "./OrderDetail.module.scss";

export default function OrderDetailClient() {
	// =================================================================
	// React Query
	// =================================================================

	return (
		<div className={styles.orderDetail}>
			{/* 전체 래퍼 */}
			<div className={styles.orderDetailWrap}>
				{/* 헤더: 타이틀 + 검색 + 메뉴 */}
				<header className={styles.orderDetailHeader}>
					<h2 className={styles.orderDetailTitle}>주문 상세보기</h2>
				</header>
				{/* 상세정보 */}
				<section className={styles.orderDetailList}></section>
			</div>
		</div>
	);
}
