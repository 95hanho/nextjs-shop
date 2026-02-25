import SellerHeader from "@/app/seller/SellerHeader";
import SellerRootProvider from "@/app/seller/SellerRootProvider";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "nextjs-shop - 판매자 페이지",
	description: "nextjs-shop의 판매자 페이지입니다.",
};

export default function SellerRootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className="seller-wrap">
			<SellerRootProvider>
				<SellerHeader />
				{children}
			</SellerRootProvider>
		</div>
	);
}
