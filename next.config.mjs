/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['./src/app/css/scss'],
    outputStyle: 'compressed',
  },
  images: {
    domains: ['bitec.local'],
  },
};

export default nextConfig;
