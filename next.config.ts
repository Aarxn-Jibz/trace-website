import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiPort = process.env.API_PORT ?? "8787";
    const apiBase = `http://localhost:${apiPort}`;
    return [
      {
        source: "/api/cases/:caseId/evidence",
        destination: `${apiBase}/api/cases/:caseId/evidence`,
      },
      {
        source: "/api/evidence/:caseId/:fileId",
        destination: `${apiBase}/api/evidence/:caseId/:fileId`,
      },
      {
        source: "/api/evidence/:caseId/:fileId/image",
        destination: `${apiBase}/api/evidence/:caseId/:fileId/image`,
      },
    ];
  },
};

export default nextConfig;
