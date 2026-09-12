import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/trace",
  output: "standalone",
  reactStrictMode: true,
  async rewrites() {
    const apiPort = process.env.API_PORT ?? "8787";
    const apiHost = process.env.API_HOST ?? "localhost";
    const apiBase = `http://${apiHost}:${apiPort}`;
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

