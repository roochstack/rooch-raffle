/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const isProduction = process.env.NODE_ENV === 'production'

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'rooch-robot.vercel.app',
        pathname: '/**',
      },
    ],
  },
  compiler: {
    removeConsole: isProduction ? { exclude: ['error'] } : false,
  },
}

export default withNextIntl(nextConfig)
