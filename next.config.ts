import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "ehfqntuqntu.cdn1.cafe24.com",
			},
		],
	},
};

export default nextConfig;
