import Script from "next/script";

export default function JoinLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<Script src="//t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="beforeInteractive" />
			{children}
		</>
	);
}
