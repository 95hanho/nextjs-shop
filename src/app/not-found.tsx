import Link from "next/link";

export default function MainNotFound() {
	return (
		<main
			style={{
				minHeight: "100vh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: "16px",
			}}
		>
			<h1 style={{ fontSize: "48px", fontWeight: "bold" }}>404</h1>

			<p style={{ fontSize: "18px" }}>페이지를 찾을 수 없습니다.</p>

			<p style={{ color: "#666" }}>요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>

			<Link
				href="/"
				style={{
					marginTop: "12px",
					padding: "10px 16px",
					border: "1px solid #000",
					textDecoration: "none",
				}}
			>
				홈으로 돌아가기
			</Link>
		</main>
	);
}
