import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiPort = process.env.API_PORT ?? "8787";
    const apiBase = `http://localhost:${apiPort}`;
    return [
      {
        source: "/api/evidence/:caseId/:fileId",
        destination: `${apiBase}/api/evidence/:caseId/:fileId`,
      },
    ];
  },
};

export default nextConfig;
