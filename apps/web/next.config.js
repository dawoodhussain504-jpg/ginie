/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@ginie/common', '@ginie/i18n', 'antd', '@ant-design/icons', '@ant-design/pro-components', '@ant-design/cssinjs'],
  async rewrites() {
    const apiTarget = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
