import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 외부 이미지 허용 도메인 (로스트아크 CDN)
  // TODO: 실제 CDN 도메인 확인 후 교체
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn-lostark.game.onstove.com",
      },
    ],
  },
};

export default nextConfig;
