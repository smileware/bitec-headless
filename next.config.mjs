/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['./src/app/css/scss'],
    outputStyle: 'compressed',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wordpress-1328545-5763448.cloudwaysapps.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Enable compression
  compress: true,
  // swcMinify is now default in Next.js 16, no need to specify
};

export default nextConfig;
