/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    loader: 'custom',
    loaderFile: './lib/cloudinaryLoader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Keep AWS S3 for existing images during migration
      {
        protocol: 'https',
        hostname: 's3-silverr-bucket.s3.eu-north-1.amazonaws.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}

export default nextConfig
