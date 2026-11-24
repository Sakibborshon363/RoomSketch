/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: "canvas" }];
    return config;
  },
  async rewrites() {
    const rawTarget =
      process.env.INTERNAL_BACKEND_URL ||
      process.env.BACKEND_URL ||
      "https://roomsketch-backend-w807.onrender.com";
    const withProtocol =
      rawTarget.startsWith("http://") || rawTarget.startsWith("https://")
        ? rawTarget
        : `https://${rawTarget}`;
    const cleanTarget = withProtocol.replace(/\/api\/?$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${cleanTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
