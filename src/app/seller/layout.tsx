export default function SellerLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ko">
			<body>
				<div className="wrap">{children}</div>
			</body>
		</html>
	);
}
