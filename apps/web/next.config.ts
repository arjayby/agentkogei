import "@agentkogei/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	distDir: process.env.NEXT_TEST_BUILD === "true" ? ".next-test" : ".next",
	typedRoutes: true,
	reactCompiler: true,
	experimental: {
		serverSourceMaps: false,
	},
	redirects: async () => [
		{
			source: "/pricing",
			destination: "/premium",
			permanent: true,
		},
	],
};

export default nextConfig;
