import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore - Ignore type error if NextConfig types don't include it yet
  allowedDevOrigins: ['192.168.89.1'],
};

export default nextConfig;
