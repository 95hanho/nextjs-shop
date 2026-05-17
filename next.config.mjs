/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "ehfqntuqntu.cdn1.cafe24.com",
			},
			{
				protocol: "https",
				hostname: "95hanho.pe.kr",
				pathname: "/uploads/**",
			},
			{
				protocol: "http",
				hostname: "localhost",
				port: "9377",
				pathname: "/uploads/**",
			},
		],
	},
};

export default nextConfig;
