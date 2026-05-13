/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@libsql/client", "libsql", "playwright"],
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push("@libsql/client", "libsql", "playwright");
    return config;
  }
};
export default nextConfig;
