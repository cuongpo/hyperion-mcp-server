/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  env: {
    HYPERION_RPC_URL: process.env.HYPERION_RPC_URL,
    HYPERION_NETWORK_NAME: process.env.HYPERION_NETWORK_NAME,
    HYPERION_EXPLORER_URL: process.env.HYPERION_EXPLORER_URL,
  },
}

module.exports = nextConfig
