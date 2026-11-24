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
      "https://roomsketch-backend.onrender.com";
    const cleanTarget = rawTarget.replace(/\/api\/?$/, "");
    return [
      {
        source: "/api/:path*",
        destination: `${cleanTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
