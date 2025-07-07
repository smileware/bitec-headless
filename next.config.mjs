/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ['./src/app/css/scss'],
    outputStyle: 'compressed',
  },
};

export default nextConfig;
