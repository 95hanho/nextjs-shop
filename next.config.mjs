/** @type {import('next').NextConfig} */
const nextConfig = {
	// config options here
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "ehfqntuqntu.cdn1.cafe24.com",
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
