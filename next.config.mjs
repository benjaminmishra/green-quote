/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pino", "pino-pretty"],
    instrumentationHook: true,
  },
};
export default nextConfig;
