/** @type {import('next').NextConfig} */
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      // TMDB 이미지
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      // 구글 소셜 로그인 프로필
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/a/**",
      },
      // AWS S3 Presigned URL (동적 도메인)
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
        pathname: "/**",
      },
    ],
    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384, 512, 768, 1024],
    minimumCacheTTL: 86400,
    qualities: [25, 50, 75, 80],
    formats: ["image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "index,follow" }],
      },
    ];
  },
  webpack(config) {
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          firebase: {
            test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/,
            name: "firebase",
            chunks: "all",
            priority: 30,
          },
          aws: {
            test: /[\\/]node_modules[\\/]@aws-sdk[\\/]/,
            name: "aws-sdk",
            chunks: "all",
            priority: 25,
          },
          ui: {
            test: /[\\/]node_modules[\\/](@headlessui|swiper|react-icons)[\\/]/,
            name: "ui-libs",
            chunks: "all",
            priority: 20,
          },
          utils: {
            test: /[\\/]node_modules[\\/](zod)[\\/]/,
            name: "utils",
            chunks: "all",
            priority: 15,
          },
        },
      },
    };

    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
