import SellerHeader from "@/app/seller/SellerHeader";
import SellerNav from "@/app/seller/SellerNav";
import SellerRootProvider from "@/app/seller/SellerRootProvider";
import { Metadata } from "next";
import "react-datepicker/dist/react-datepicker.css";

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
				<SellerNav />
				{children}
			</SellerRootProvider>
		</div>
	);
}
