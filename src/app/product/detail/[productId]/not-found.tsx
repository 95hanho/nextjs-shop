import Link from "next/link";
import styles from "./ProductDetail.module.scss";

export default function ProductDetailNotFound() {
	return (
		<div
			style={{
				minHeight: "60vh",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				gap: "12px",
				textAlign: "center",
			}}
		>
			<h2 style={{ fontSize: "20px", fontWeight: 600 }}>상품을 찾을 수 없어요</h2>

			<p style={{ color: "#666" }}>삭제되었거나 존재하지 않는 상품입니다.</p>

			<div style={{ display: "flex", gap: "8px", marginTop: "16px", fontSize: "18px" }}>
				<Link href="/">
					<button className={styles.notFoundButton}>홈으로</button>
				</Link>
			</div>
		</div>
	);
}
