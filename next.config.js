const nextConfig = {
	distDir: process.env.NEXT_DIST_DIR || '.next',
	experimental: {
		cpus: 1,
	},
};

module.exports = nextConfig;
