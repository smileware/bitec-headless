/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['./src/app/css/scss'],
    outputStyle: 'compressed',
  },
  images: {
    domains: ['wordpress-1328545-5763448.cloudwaysapps.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Enable compression
  compress: true,
  // Optimize production builds
  swcMinify: true,
};

export default nextConfig;
