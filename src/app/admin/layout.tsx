import AdminHeader from "@/app/admin/AdminHeader";
import AdminRootProvider from "@/app/admin/AdminRootProvider";

export default function AdminRootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ko">
			<body>
				<div className="wrap admin-wrap">
					<AdminRootProvider>
						<AdminHeader />
						{children}
					</AdminRootProvider>
				</div>
			</body>
		</html>
	);
}
