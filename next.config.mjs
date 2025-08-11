/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['./src/app/css/scss'],
    outputStyle: 'compressed',
  },
  images: {
    domains: ['https://wordpress-1328545-5763448.cloudwaysapps.com'],
  },
};

export default nextConfig;
