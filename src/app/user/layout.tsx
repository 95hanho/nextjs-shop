import { Metadata } from "next";

export const metadata: Metadata = {
	title: "nextjs-shop 로그인",
	description: "nextjs-shop 로그인",
};

export default async function LoginLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <>{children}</>;
}
