import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  allowedDevOrigins: ['https://dev.brunoprado.lol/', 'http://localhost:3000/'],
  images: {
    unoptimized: true
  }
}

export default nextConfig
