/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false
  },
  typescript: {
    ignoreBuildErrors: false
  },
  output: process.env.NEXT_OUTPUT || undefined
};

export default nextConfig;
